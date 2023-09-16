import { FUNCTION_NAMES } from './constants';
import { FunctionCall, PageContent } from './types';
import { Config } from './config';

type FunctionCallResult = {
  success: boolean;
  error?: Error | string | unknown;
  script?: string;
  summary?: string;
  text?: string;
  url?: string;
};

export const handleFunctionCall = async (
  functionCall: FunctionCall,
  options?: PageContent
): Promise<FunctionCallResult> => {
  const args = JSON.parse(functionCall.arguments);
  switch (functionCall.name) {
    case FUNCTION_NAMES.INJECT_SCRIPT:
      return await injectScript(args['function']);

    case FUNCTION_NAMES.SUMMARIZE:
      return await summarize(args['url'], options);

    case FUNCTION_NAMES.READ:
      return await read(args['url'], args['query'], args['code'], options);

    case FUNCTION_NAMES.NOTES:
      return await useNotes(args['action'], args['text'], args['url']);

    default:
      throw new Error('No function found');
  }
};

const injectScript = async (func: string): Promise<FunctionCallResult> => {
  console.log('injecting script', func);

  return {
    success: true,
    script: func,
  };
};

const summarize = async (url: string, pageContent?: PageContent): Promise<FunctionCallResult> => {
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

const read = async (
  url: string,
  query?: string,
  code = false,
  pageContent?: PageContent
): Promise<FunctionCallResult> => {
  try {
    console.log('reading page', url, query, code, pageContent);
    const response = await fetch(`${Config.API_BASE_URL}/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        query,
        code,
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

const createNote = async (text: string, url?: string): Promise<FunctionCallResult> => {
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

const searchNotes = async (text: string, url?: string): Promise<FunctionCallResult> => {
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

const useNotes = async (
  action: string,
  text: string,
  url?: string
): Promise<FunctionCallResult> => {
  switch (action) {
    case 'create':
      return await createNote(text, url);
    case 'get':
      return await searchNotes(text, url);
    default:
      throw new Error('Unknown action');
  }
};
