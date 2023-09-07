import { FUNCTION_NAMES } from './constants';
import { FunctionCall, PageContent } from './types';
import { Config } from './config';

export const handleFunctionCall = async (
  functionCall: FunctionCall,
  options?: PageContent
): Promise<unknown> => {
  const args = JSON.parse(functionCall.arguments);
  switch (functionCall.name) {
    case FUNCTION_NAMES.SUMMARIZE:
      return await summarize(args['url'], options);

    case FUNCTION_NAMES.READ:
      return await read(args['url'], args['query'], options);

    case FUNCTION_NAMES.NOTES:
      return await useNotes(args['action'], args['text'], args['url']);

    default:
      throw new Error('No function found');
  }
};

const summarize = async (url: string, pageContent?: PageContent): Promise<object> => {
  try {
    const response = await fetch(`${Config.API_BASE_URL}/summarize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        pageContent,
      }),
    });
    const result = await response.json();
    return {
      success: true,
      ...result,
    };
  } catch (err) {
    const error = err;
    return {
      success: false,
      error,
    };
  }
};

const read = async (url: string, query?: string, pageContent?: PageContent): Promise<object> => {
  try {
    const response = await fetch(`${Config.API_BASE_URL}/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        query,
        pageContent,
      }),
    });
    const result = await response.json();
    return {
      success: true,
      ...result,
    };
  } catch (err) {
    const error = err;
    return {
      success: false,
      error,
    };
  }
};

const createNote = async (text: string, url?: string): Promise<object> => {
  try {
    const response = await fetch(`${Config.API_BASE_URL}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        url,
      }),
    });
    const result = await response.json();
    return {
      success: true,
      ...result,
    };
  } catch (err) {
    const error = err;
    return {
      success: false,
      error,
    };
  }
};

const searchNotes = async (text: string, url?: string): Promise<object> => {
  try {
    const response = await fetch(`${Config.API_BASE_URL}/notes/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: text,
        url,
      }),
    });
    const result = await response.json();
    return {
      success: true,
      ...result,
    };
  } catch (err) {
    const error = err;
    return {
      success: false,
      error,
    };
  }
};

const useNotes = async (action: string, text: string, url?: string): Promise<object> => {
  switch (action) {
    case 'create':
      return await createNote(text, url);
    case 'get':
      return await searchNotes(text, url);
    default:
      throw new Error('Unknown action');
  }
};
