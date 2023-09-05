import OpenAI from 'openai';
import { ChatCompletionMessage } from 'openai/resources/chat';
import { FUNCTION_NAMES } from './constants';
import { db } from './firebase';
import { searchInPinecone } from './pinecone';
import { MessageOptions, PageContent, VectorMetadata } from '../types';
import { getSummary } from './summaries';

export const functions: OpenAI.Chat.Completions.CompletionCreateParams.Function[] = [
  {
    name: FUNCTION_NAMES.SUMMARIZE,
    description: 'Summarizes a given URL.',
    parameters: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL of the page.' },
      },
      required: ['url'],
    },
  },
  {
    name: FUNCTION_NAMES.NOTES,
    description: "Creates or retrieves a user's notes.",
    parameters: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['create', 'get'] },
        text: {
          type: 'string',
          description:
            'The markdown text of the note if creating a new note or the search query if retrieving notes.',
        },
        url: { type: 'string', description: 'URL of the page for the note.' },
      },
      required: ['action', 'text'],
    },
  },
];

export const callFunction = async (
  functionCall: ChatCompletionMessage.FunctionCall,
  options: MessageOptions
): Promise<unknown> => {
  const args = JSON.parse(functionCall.arguments);
  switch (functionCall.name) {
    case FUNCTION_NAMES.SUMMARIZE:
      return await summarize(args['url'], options?.pageContent);

    case FUNCTION_NAMES.NOTES:
      return await useNotes(args['action'], args['text'], args['url']);

    default:
      throw new Error('No function found');
  }
};

const summarize = async (url: string, pageContent?: PageContent): Promise<object> => {
  const summary = await getSummary(pageContent);
  if (!summary) {
    return {
      success: false,
      error: 'Could not summarize the provided URL.',
    };
  }

  db.collection('summaries').add({
    createdAt: new Date(),
    updatedAt: new Date(),
    url,
    summary,
  });

  return {
    success: true,
    summary,
  };
};

const getNotes = async (text: string, url?: string): Promise<object> => {
  const notes = await searchInPinecone(text, url);
  const matchingNotes = notes.matches?.map((match) => {
    const metadata = match.metadata as VectorMetadata;
    return {
      id: match.id,
      url: metadata?.url,
      text: metadata?.text,
    };
  });

  return {
    success: true,
    notes: matchingNotes,
  };
};

const createNote = async (text: string, url?: string): Promise<object> => {
  const noteData = {
    createdAt: new Date(),
    updatedAt: new Date(),
    text,
    url,
  };

  const noteRef = await db.collection('notes').add(noteData);

  return {
    success: true,
    note: {
      id: noteRef.id,
      ...noteData,
    },
  };
};

const useNotes = async (action: string, text: string, url?: string): Promise<object> => {
  switch (action) {
    case 'create':
      return await createNote(text, url);
    case 'get':
      return await getNotes(text, url);
    default:
      throw new Error('Unknown action');
  }
};
