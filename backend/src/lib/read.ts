import { Readability, isProbablyReaderable } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import { Config } from './config';
import { TokenTextSplitter, RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { saveInPinecone, searchInPinecone } from './pinecone';
import { PINECONE_NAMESPACES } from './constants';
import { PageContent, TextContentVectorMetadata } from '../types';

export const getUrlText = async (htmlString: string) => {
  const { document } = new JSDOM(htmlString).window;

  if (isProbablyReaderable(document)) {
    const article = new Readability(document).parse();
    if (article?.textContent) {
      console.log('using readability text', article.textContent);
      return article.textContent;
    }
    console.log('using body text', document.body.textContent);
    return document.body.textContent;
  }
  return document.body.textContent;
};

const saveContents = async ({
  url,
  text,
  isCode,
}: {
  url: string;
  text: string;
  isCode: boolean;
}) => {
  // If the text is too long, split it into chunks and summarize each chunk
  const splitter = isCode
    ? RecursiveCharacterTextSplitter.fromLanguage('html', {
        chunkSize: Config.CODE_CHUNK_SIZE,
        chunkOverlap: 0,
      })
    : new TokenTextSplitter({
        encodingName: Config.EMBEDDING_MODEL,
        chunkSize: Config.CHUNK_SIZE,
        chunkOverlap: 0,
      });

  const output = await splitter.createDocuments([text]);
  for (const doc of output) {
    await saveInPinecone(PINECONE_NAMESPACES.TEXT_CONTENTS, doc.pageContent, {
      url,
      text: doc.pageContent,
      isCode,
    });
  }

  return;
};

export const readContents = async (
  url: string,
  query?: string,
  code = false,
  pageContent?: PageContent
): Promise<object[] | null> => {
  if (!query && !pageContent) {
    return null;
  }

  return getContentsForQuery(url, query, code, pageContent);
};

const getContentsForQuery = async (
  url: string,
  query = '',
  code = false,
  pageContent?: PageContent
): Promise<object[] | null> => {
  const results = await searchInPinecone(
    PINECONE_NAMESPACES.TEXT_CONTENTS,
    query,
    {
      url: { $eq: url },
      isCode: { $eq: code },
    },
    3
  );

  if (!results.matches || results.matches.length === 0) {
    if (!pageContent) {
      return null;
    }
    let text;
    if (pageContent.content) {
      text = code ? pageContent.content : await getUrlText(pageContent.content);
      text = text?.replace(/\n/g, ' ');
    } else if (pageContent.textContent && !code) {
      text = pageContent.textContent.replace(/\n/g, ' ');
    } else {
      return null;
    }
    if (!text) {
      return null;
    }

    await saveContents({ url, text, isCode: code });
    return getContentsForQuery(url, query, code, pageContent);
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
