import { Pinecone } from '@pinecone-database/pinecone';
import { Config } from '../lib/config';

const run = async () => {
  const pinecone = new Pinecone();
  await pinecone.createIndex({
    name: Config.PINECONE_INDEX_NAME,
    dimension: Config.EMBEDDING_DIMENSION,
    metadataConfig: {
      indexed: ['url'], // TODO: index user ids too
    },
  });
  console.log(`Index ${Config.PINECONE_INDEX_NAME} created!`);
};

run();
