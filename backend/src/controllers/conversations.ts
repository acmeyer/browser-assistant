/* eslint-disable max-len */
import { Request, Response } from 'express';
import OpenAI from 'openai';
import { ChatCompletionMessage, CreateChatCompletionRequestMessage } from 'openai/resources/chat';
import { Config } from '../lib/config';
import { messageReducer } from '../lib/utils';
import { Message, Conversation, MessageOptions } from '../types';
import { functions } from '../lib/functions';
import { db } from '../lib/firebase';

export const getLatestConversationController = async (_req: Request, res: Response) => {
  const snapshot = await db
    .collection('conversations')
    // where the last activity was within the last hour date
    .where('lastActivityAt', '>', new Date(Date.now() - 60 * 60 * 1000))
    .orderBy('lastActivityAt', 'desc')
    .limit(1)
    .get();

  let conversation: Conversation;
  if (snapshot.empty) {
    // If no conversation exists, create a new one
    const conversationData = {
      createdAt: new Date(),
      updatedAt: new Date(),
      lastActivityAt: new Date(),
    };
    const conversationRef = await db.collection('conversations').add(conversationData);
    conversation = {
      id: conversationRef.id,
      ...conversationData,
      messages: [],
    };
  } else {
    const conversationData = snapshot.docs[0].data();
    const conversationMessages = await db
      .collection('conversations')
      .doc(snapshot.docs[0].id)
      .collection('messages')
      .orderBy('createdAt', 'desc')
      .get();
    conversationData.messages = conversationMessages.docs.map((doc) => {
      return {
        id: doc.id,
        ...doc.data(),
      } as Message;
    });
    conversation = {
      id: snapshot.docs[0].id,
      ...conversationData,
      messages: conversationData.messages,
    } as Conversation;
  }

  res.send(conversation);
};

export const createConversationController = async (_req: Request, res: Response) => {
  const conversationData = {
    createdAt: new Date(),
    updatedAt: new Date(),
    lastActivityAt: new Date(),
  };
  const conversationRef = await db.collection('conversations').add(conversationData);
  const conversation: Conversation = {
    id: conversationRef.id,
    ...conversationData,
    messages: [],
  };
  res.send(conversation);
};

const getChatCompletionStream = async ({
  systemPrompt,
  messages,
  functions,
  temperature,
}: {
  systemPrompt: ChatCompletionMessage;
  messages: ChatCompletionMessage[];
  functions?: OpenAI.Chat.Completions.CompletionCreateParams.Function[];
  temperature?: 0.5;
}) => {
  const openai = new OpenAI({
    apiKey: Config.OPENAI_API_KEY,
  });

  const stream = await openai.chat.completions.create({
    model: Config.CHAT_MODEL,
    messages: [systemPrompt, ...messages],
    functions,
    temperature: temperature,
    stream: true,
  });

  return stream;
};

const streamChatCompletion = async ({
  systemPrompt,
  messages,
  functions,
  temperature,
  response,
  conversationRef,
}: {
  systemPrompt: ChatCompletionMessage;
  messages: ChatCompletionMessage[];
  functions?: OpenAI.Chat.Completions.CompletionCreateParams.Function[];
  temperature?: 0.5;
  response: Response;
  conversationRef: FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData>;
  options: MessageOptions;
}) => {
  const stream = await getChatCompletionStream({
    systemPrompt,
    messages,
    functions,
    temperature,
  });

  let newAssistantMessage = {} as ChatCompletionMessage;
  for await (const part of stream) {
    newAssistantMessage = messageReducer(newAssistantMessage, part);
    response.write(JSON.stringify(newAssistantMessage));
  }
  messages.push(newAssistantMessage);

  const lastMessage = messages[messages.length - 1];
  await Promise.all([
    conversationRef.update({
      lastActivityAt: new Date(),
      updatedAt: new Date(),
    }),
    conversationRef.collection('messages').add({
      ...lastMessage,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  ]);

  // handle function call
  // if (newAssistantMessage.function_call) {
  //   const result = await callFunction(newAssistantMessage.function_call, options);
  //   const newMessage = {
  //     role: 'function' as const,
  //     name: newAssistantMessage.function_call.name,
  //     content: JSON.stringify(result),
  //   };
  //   response.write(JSON.stringify(newMessage));
  //   messages.push(newMessage);
  //   await Promise.all([
  //     conversationRef.update({
  //       lastActivityAt: new Date(),
  //       updatedAt: new Date(),
  //     }),
  //     conversationRef.collection('messages').add({
  //       ...newMessage,
  //       createdAt: new Date(),
  //       updatedAt: new Date(),
  //     }),
  //   ]);

  //   // Recursively call the function again, in order to get the next message from GPT
  //   await streamChatCompletion({
  //     systemPrompt,
  //     messages,
  //     functions,
  //     temperature,
  //     response,
  //     conversationRef,
  //     options,
  //   });
  // }
};

export const createNewConversationMessageController = async (req: Request, res: Response) => {
  const {
    conversationId,
    message,
    options,
  }: {
    conversationId: string;
    message: Message;
    options: MessageOptions;
  } = req.body;

  // Get the conversation's messages
  const conversationRef = db.collection('conversations').doc(conversationId);
  const conversationMessages = await conversationRef
    .collection('messages')
    .orderBy('createdAt', 'desc')
    .get();
  const messages: OpenAI.Chat.Completions.CreateChatCompletionRequestMessage[] = [];
  conversationMessages.forEach((doc) => {
    messages.push({
      role: doc.data().role,
      // Only include name if it exists
      ...(doc.data().name && { name: doc.data().name }),
      // Only include function_call if it exists
      ...(doc.data().function_call && { function_call: doc.data().function_call }),
      content: doc.data().content,
    });
  });
  const newMessage: CreateChatCompletionRequestMessage = {
    role: message.role,
    content: message.content,
    name: message.name,
  };
  messages.push(newMessage);
  await conversationRef.collection('messages').add({
    role: newMessage.role,
    content: newMessage.content,
    name: newMessage.name,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  const systemPrompt: ChatCompletionMessage = {
    role: 'system',
    content: `You are a helpful assistant that is also a browser extension. Your job is to help the user accomplish what they want. You will be given some context about the user and their current browsing session if it is available. You can use this information however you see fit. As a browser extension, you can also modify the webpage's DOM.
    
    Your responses should be as concise as possible but don't leave out important information. You don't need to tell the user that you're an AI or Large Language Model or assistant, assume they already know this.${
      options.url ? '\n\nCurrent Browser URL: ' + options.url : ''
    }`,
  };

  await streamChatCompletion({
    systemPrompt,
    messages,
    functions,
    temperature: 0.5,
    response: res,
    conversationRef,
    options,
  });

  res.end();
};
