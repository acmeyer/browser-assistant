export type ChatMessage = {
  role: 'user' | 'system' | 'assistant' | 'function';
  content: string;
};

export type Message = {
  id: string;
  role: 'user' | 'system' | 'assistant' | 'function';
  name?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Conversation = {
  id: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
};

export type CreateConversationData = {
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
};

export type NoteVectorMetadata = {
  url?: string;
  text?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type SummaryVectorMetadata = {
  url?: string;
  summary?: string;
};

export type TextContentVectorMetadata = {
  url?: string;
  text?: string;
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
