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
