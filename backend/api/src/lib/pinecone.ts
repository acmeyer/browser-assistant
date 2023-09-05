import { PineconeClient, QueryRequest } from '@pinecone-database/pinecone';
import { Config } from './config';
import OpenAI from 'openai';

export const pinecone = new PineconeClient();

export const getEmbedding = async (text: string) => {
  const openai = new OpenAI({
    apiKey: Config.OPENAI_API_KEY,
  });

  const embedding = await openai.embeddings.create({
    input: text || '',
    model: Config.EMBEDDINGS_MODEL,
  });

  return embedding.data[0].embedding;
};

export const saveInPinecone = async (noteId: string, text: string, url?: string) => {
  await pinecone.init({
    environment: Config.PINECONE_ENVIRONMENT,
    apiKey: Config.PINECONE_API_KEY,
  });

  const indexesList = await pinecone.listIndexes();
  if (!indexesList.includes(Config.PINECONE_INDEX_NAME)) {
    await pinecone.createIndex({
      createRequest: {
        name: Config.PINECONE_INDEX_NAME,
        dimension: Config.EMBEDDING_DIMENSION,
        metadataConfig: {
          indexed: ['url'],
        },
      },
    });
  }
  const index = pinecone.Index(Config.PINECONE_INDEX_NAME);

  const embedding = await getEmbedding(text);
  const upsertRequest = {
    vectors: [
      {
        id: noteId,
        values: embedding,
        metadata: {
          url,
          text,
        },
      },
    ],
    namespace: 'user-1',
  };
  const upsertResponse = await index.upsert({ upsertRequest });
  return upsertResponse;
};

export const searchInPinecone = async (text: string, url?: string) => {
  await pinecone.init({
    environment: Config.PINECONE_ENVIRONMENT,
    apiKey: Config.PINECONE_API_KEY,
  });

  const index = pinecone.Index(Config.PINECONE_INDEX_NAME);
  const embedding = await getEmbedding(text);
  const queryRequest: QueryRequest = {
    vector: embedding,
    topK: 5,
    includeValues: true,
    includeMetadata: true,
    namespace: 'user-1',
  };
  // Add filter if url is provided
  if (url) {
    queryRequest['filter'] = {
      url: { $eq: url },
    };
  }
  const queryResponse = await index.query({ queryRequest });
  return queryResponse;
};
