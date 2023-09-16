import { Pinecone, QueryRequest, RecordMetadata } from '@pinecone-database/pinecone';
import { Config } from './config';
import OpenAI from 'openai';
import { v4 as uuidv4 } from 'uuid';

export const pinecone = new Pinecone({
  environment: Config.PINECONE_ENVIRONMENT,
  apiKey: Config.PINECONE_API_KEY,
});

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
  const indexesList = await pinecone.listIndexes();
  const indexNames = indexesList.map((index) => index.name);
  if (!indexNames.includes(Config.PINECONE_INDEX_NAME)) {
    await pinecone.createIndex({
      name: Config.PINECONE_INDEX_NAME,
      dimension: Config.EMBEDDING_DIMENSION,
      metadataConfig: {
        indexed: ['url'], // TODO: index user ids too
      },
    });
  }
  const index = pinecone.Index(Config.PINECONE_INDEX_NAME);

  const embedding = await getEmbedding(text);
  const vectors = [
    {
      id: uuidv4(),
      values: embedding,
      metadata: metadata as RecordMetadata,
    },
  ];
  const indexNamespace = index.namespace(namespace);
  const upsertResponse = await indexNamespace.upsert(vectors);
  return upsertResponse;
};

export const searchInPinecone = async (
  namespace: string,
  query: string,
  metadataFilters?: QueryRequest['filter'],
  results = 3
) => {
  const index = pinecone.Index(Config.PINECONE_INDEX_NAME);
  const embedding = await getEmbedding(query);
  const indexNamespace = index.namespace(namespace);
  const queryResponse = await indexNamespace.query({
    vector: embedding,
    topK: results,
    includeValues: true,
    includeMetadata: true,
    filter: metadataFilters,
  });
  return queryResponse;
};
