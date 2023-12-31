export type FunctionCall = {
  name: string;
  arguments: string;
};

export type Message = {
  id?: string;
  role: 'user' | 'system' | 'assistant' | 'function';
  content: string | null;
  name?: string;
  function_call?: FunctionCall;
  createdAt: Date;
  updatedAt: Date;
};

export type Conversation = {
  id?: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
};

export type MessageOptions = {
  url?: string;
  pageContent?: PageContent;
};

export type PageContent = {
  title?: string;
  content?: string;
  textContent?: string;
  length?: number;
  excerpt?: string;
  byline?: string;
  dir?: string;
  siteName?: string;
  lang?: string;
  code?: string | null;
};

export interface ChatCompletionMessage {
  /**
   * The contents of the message.
   */
  content: string | null;

  /**
   * The role of the author of this message.
   */
  role: 'system' | 'user' | 'assistant' | 'function';

  /**
   * The name and arguments of a function that should be called, as generated by the
   * model.
   */
  function_call?: ChatCompletionMessage.FunctionCall;
}

export type FunctionCall = {
  /**
   * The arguments to call the function with, as generated by the model in JSON
   * format. Note that the model does not always generate valid JSON, and may
   * hallucinate parameters not defined by your function schema. Validate the
   * arguments in your code before calling your function.
   */
  arguments: string;

  /**
   * The name of the function to call.
   */
  name: string;
};
