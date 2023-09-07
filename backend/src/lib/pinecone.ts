import { PineconeClient, QueryRequest } from '@pinecone-database/pinecone';
import { Config } from './config';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';

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

export const saveInPinecone = async (namespace: string, text: string, metadata: object) => {
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
          indexed: ['url'], // TODO: index user ids too
        },
      },
    });
  }
  const index = pinecone.Index(Config.PINECONE_INDEX_NAME);

  const embedding = await getEmbedding(text);
  const upsertRequest = {
    vectors: [
      {
        id: uuidv4(),
        values: embedding,
        metadata,
      },
    ],
    namespace,
  };
  const upsertResponse = await index.upsert({ upsertRequest });
  return upsertResponse;
};

export const searchInPinecone = async (
  namespace: string,
  query: string,
  metadataFilters?: QueryRequest['filter'],
  results = 3
) => {
  await pinecone.init({
    environment: Config.PINECONE_ENVIRONMENT,
    apiKey: Config.PINECONE_API_KEY,
  });

  const index = pinecone.Index(Config.PINECONE_INDEX_NAME);
  const embedding = await getEmbedding(query);
  const queryRequest: QueryRequest = {
    vector: embedding,
    topK: results,
    includeValues: true,
    includeMetadata: true,
    namespace,
    filter: metadataFilters,
  };
  const queryResponse = await index.query({ queryRequest });
  return queryResponse;
};
