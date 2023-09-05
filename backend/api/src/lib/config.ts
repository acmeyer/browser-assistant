export const Config = {
  // OpenAI
  OPENAI_API_KEY: process.env.OPENAI_API_KEY as string,
  OPENAI_API_ORG_ID: process.env.OPENAI_API_ORG_ID as string,
  CHAT_MODEL: process.env.LONG_CONTEXT_CHAT_MODEL as string,
  FREE_CHAT_MODEL: process.env.FREE_CHAT_MODEL as string,
  LONG_CONTEXT_CHAT_MODEL: process.env.LONG_CONTEXT_CHAT_MODEL as string,
  PREMIUM_CHAT_MODEL: process.env.PREMIUM_CHAT_MODEL as string,
  DEFAULT_CHAT_MODEL: process.env.DEFAULT_CHAT_MODEL as string,
  EMBEDDINGS_MODEL: process.env.EMBEDDINGS_MODEL as string,
  SUMMARY_MODEL: process.env.SUMMARY_MODEL as string,

  // Pinecone
  PINECONE_API_KEY: process.env.PINECONE_API_KEY as string,
  PINECONE_ENVIRONMENT: process.env.PINECONE_ENVIRONMENT as string,
  PINECONE_INDEX_NAME: process.env.PINECONE_INDEX_NAME as string,
  EMBEDDING_DIMENSION: 1536,

  // Server config
  API_MIN_INSTANCE: process.env.API_MIN_INSTANCE as string,
  API_TIMEOUT_SECONDS: process.env.API_TIMEOUT_SECONDS as string,

  // General
  ENVIRONMENT: process.env.ENVIRONMENT as string,
  API_BASE_URL: process.env.API_BASE_URL as string,
};
