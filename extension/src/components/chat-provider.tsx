import { createContext, useContext, useState, useEffect } from 'react';
import { Conversation, Message, MessageOptions, ChatCompletionMessage } from '@/lib/types';
import { nanoid } from '@/lib/nanoid';
import { Config } from '@/lib/config';
import { handleFunctionCall } from '@/lib/functions';
import { useChrome } from './chrome-provider';

export type ChatProviderProps = {
  children: React.ReactNode;
};

export type ChatProviderState = {
  conversation?: Conversation;
  error?: Error | unknown;
  isLoading: boolean;
  isAssistantResponding: boolean;
  addMessage: (message: Message, options?: object) => Promise<void>;
  startNewConversation: () => Promise<void>;
  input: string;
  setInput: (input: string) => void;
};

const initialState: ChatProviderState = {
  isLoading: true,
  isAssistantResponding: false,
  input: '',
  setInput: () => null,
  addMessage: () => new Promise(() => null),
  startNewConversation: () => new Promise(() => null),
};

const ChatProviderContext = createContext<ChatProviderState>(initialState);

export function ChatProvider({ children }: ChatProviderProps) {
  const [currentConversation, setCurrentConversation] =
    useState<ChatProviderState['conversation']>();
  const [input, setInput] = useState<string>('');
  const [error, setError] = useState<Error | unknown | undefined>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAssistantResponding, setIsAssistantResponding] = useState<boolean>(false);
  const { getPageContent, injectScript } = useChrome();

  const fetchConversation = async () => {
    let conversation: Conversation | undefined;
    let error: unknown | undefined;
    try {
      const response = await fetch(`${Config.API_BASE_URL}/conversations/latest`, {
        method: 'GET',
      });
      conversation = await response.json();
    } catch (err) {
      error = err;
    }
    return { conversation, error };
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const { conversation, error: fetchConversationError } = await fetchConversation();
      setCurrentConversation(conversation);
      setError(fetchConversationError);
      setIsLoading(false);
    })();
  }, []);

  const addNewMessage = async (message: Message, options?: MessageOptions) => {
    // First add the message to the local conversation to reduce latency
    setCurrentConversation((prevConversation) => {
      if (!prevConversation) {
        return prevConversation;
      }
      const conversationMessages = prevConversation.messages ? prevConversation.messages : [];
      return {
        ...prevConversation,
        messages: [message, ...conversationMessages],
      };
    });

    setIsAssistantResponding(true);
    try {
      const messageResponse = await fetch(`${Config.API_BASE_URL}/messages/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          conversationId: currentConversation?.id,
          message,
          options,
        }),
      });

      if (messageResponse.body) {
        const reader = messageResponse.body.getReader();
        let finalResult: ChatCompletionMessage | undefined;

        const stream = new ReadableStream({
          start(controller) {
            function push() {
              // "done" is a Boolean and value a "Uint8Array"
              reader.read().then(({ done, value }) => {
                if (done) {
                  controller.close();
                  return;
                }

                const decoder = new TextDecoder('utf-8');
                const result = decoder.decode(value);

                // Create new empty message object to use for streaming, these will change
                let newMessage = {
                  id: nanoid(),
                  role: 'assistant',
                  content: '',
                  createdAt: new Date(),
                  updatedAt: new Date(),
                } as Message;

                setCurrentConversation((prevConversation) => {
                  if (!prevConversation) return prevConversation;

                  try {
                    const resultJson = JSON.parse(result);
                    // Merge empty message with actual results
                    newMessage = {
                      ...newMessage,
                      ...resultJson,
                    };
                    finalResult = resultJson;
                  } catch (error) {
                    return prevConversation;
                  }

                  // Add the new message to the conversation
                  const conversationMessages = prevConversation.messages
                    ? prevConversation.messages
                    : [];

                  const lastMessage = conversationMessages[0];
                  if (lastMessage.role === newMessage.role) {
                    // Assume continuing the same message if roles haven't changed
                    conversationMessages[0] = newMessage;
                    return {
                      ...prevConversation,
                      messages: conversationMessages,
                    };
                  }

                  return {
                    ...prevConversation,
                    messages: [
                      {
                        id: nanoid(), // create new id to avoid duplicate keys
                        ...newMessage,
                      },
                      ...conversationMessages,
                    ],
                  };
                });
                push();
              });
            }

            push();
          },
        });

        new Response(stream).text().then(async () => {
          if (finalResult && finalResult.function_call) {
            const pageContent = await getPageContent();
            const functionResult = await handleFunctionCall(finalResult.function_call, pageContent);
            if (functionResult.script) {
              // Inject the script into the page
              await injectScript(functionResult.script);
              functionResult.script = undefined;
            }
            if (functionResult) {
              const newFunctionMessage = {
                role: 'function' as const,
                name: finalResult.function_call.name,
                content: JSON.stringify(functionResult),
                createdAt: new Date(),
                updatedAt: new Date(),
              };
              await addNewMessage(newFunctionMessage, { url: options?.url });
            }
          }
          setIsAssistantResponding(false);
        });
      }
    } catch (error) {
      console.error(error);
      setError(error as Error);
      setIsAssistantResponding(false);
    }
  };

  const value: ChatProviderState = {
    startNewConversation: async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${Config.API_BASE_URL}/conversations/new`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });
        const newConversation = await response.json();
        setCurrentConversation(newConversation);
      } catch (error) {
        console.error(error);
        setError(error as Error);
      }
      setIsLoading(false);
    },
    addMessage: addNewMessage,
    conversation: currentConversation,
    error,
    isLoading,
    isAssistantResponding,
    input,
    setInput,
  };

  return <ChatProviderContext.Provider value={value}>{children}</ChatProviderContext.Provider>;
}

export const useChat = () => {
  const context = useContext(ChatProviderContext);

  if (context === undefined) throw new Error('useChat must be used within a ChatProviderContext');

  return context;
};
