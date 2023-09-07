import { Readability, isProbablyReaderable } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import { Config } from './config';
import { TokenTextSplitter } from 'langchain/text_splitter';
import { saveInPinecone, searchInPinecone } from './pinecone';
import { PINECONE_NAMESPACES } from './constants';
import { PageContent, TextContentVectorMetadata } from '../types';

export const getUrlText = async (htmlString: string) => {
  const { document } = new JSDOM(htmlString).window;

  if (!isProbablyReaderable(document)) {
    const article = new Readability(document).parse();
    if (article?.textContent) {
      return article.textContent;
    }
    return document.body.textContent;
  }

  return document.body.textContent;
};

const saveTextContents = async ({ url, text }: { url: string; text: string }) => {
  // If the text is too long, split it into chunks and summarize each chunk
  const splitter = new TokenTextSplitter({
    encodingName: 'cl100k_base',
    chunkSize: Config.CHUNK_SIZE,
    chunkOverlap: 0,
  });

  const output = await splitter.createDocuments([text]);
  for (const doc of output) {
    await saveInPinecone(PINECONE_NAMESPACES.TEXT_CONTENTS, doc.pageContent, {
      url,
      text: doc.pageContent,
    });
  }

  return;
};

export const readContents = async (
  url: string,
  query?: string,
  pageContent?: PageContent
): Promise<object[] | null> => {
  if (!query && !pageContent) {
    return null;
  }

  if (query) {
    return getContentsForQuery(url, query, pageContent);
  }

  return null;
};

const getContentsForQuery = async (
  url: string,
  query: string,
  pageContent?: PageContent
): Promise<object[] | null> => {
  const results = await searchInPinecone(
    PINECONE_NAMESPACES.TEXT_CONTENTS,
    query,
    {
      url: { $eq: url },
    },
    3
  );

  if (!results.matches || results.matches.length === 0) {
    if (!pageContent) {
      return null;
    }
    let text;
    if (pageContent.content) {
      text = await getUrlText(pageContent.content);
      text = text?.replace(/\n/g, ' ');
    } else if (pageContent.textContent) {
      text = pageContent.textContent.replace(/\n/g, ' ');
    } else {
      return null;
    }
    if (!text) {
      return null;
    }

    await saveTextContents({ url, text });
    return getContentsForQuery(url, query, pageContent);
  }

  const matchingContents = results.matches?.map((match) => {
    const metadata = match.metadata as TextContentVectorMetadata;
    return {
      id: match.id,
      url: metadata?.url,
      text: metadata?.text,
    };
  });

  return matchingContents;
};
