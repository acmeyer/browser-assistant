import OpenAI from 'openai';
import { Config } from './config';
import { PageContent, SummaryVectorMetadata } from '../types';
import { encodingForModel, TiktokenModel } from 'js-tiktoken';
import { TokenTextSplitter } from 'langchain/text_splitter';
import { saveInPinecone, searchInPinecone } from './pinecone';
import { getUrlText } from './read';
import { PINECONE_NAMESPACES } from './constants';

const getCompletion = async ({ text }: { text: string }) => {
  const openai = new OpenAI({
    apiKey: Config.OPENAI_API_KEY,
  });

  const completion = await openai.chat.completions.create({
    model: Config.SUMMARY_MODEL,
    messages: [
      {
        role: 'system',
        content: 'Your job is to return a summary of the provided text.',
      },
      {
        role: 'user',
        content: `Please summarize the following text:\n\n${text}`,
      },
    ],
    temperature: 0,
  });

  return completion.choices[0].message.content;
};

const getSummaryCompletion = async ({ url, text }: { url: string; text: string }) => {
  // Measure the number of tokens for the text
  const encoding = encodingForModel(Config.SUMMARY_MODEL as TiktokenModel);
  const encodedText = encoding.encode(text);
  const numTokens = encodedText.length;

  if (numTokens <= Config.CHUNK_SIZE) {
    const summary = await getCompletion({ text });
    await saveInPinecone(PINECONE_NAMESPACES.SUMMARIES, text, { url, summary });
    return summary;
  }

  // If the text is too long, split it into chunks and summarize each chunk
  const splitter = new TokenTextSplitter({
    encodingName: Config.EMBEDDING_MODEL,
    chunkSize: Config.CHUNK_SIZE,
    chunkOverlap: 0,
  });

  const output = await splitter.createDocuments([text]);

  const summaries = [];
  for (const doc of output) {
    const [summary] = await Promise.all([
      getCompletion({ text: doc.pageContent }),
      saveInPinecone(PINECONE_NAMESPACES.TEXT_CONTENTS, doc.pageContent, {
        url,
        text: doc.pageContent,
      }),
    ]);
    summaries.push(summary);
  }

  const summary = await getCompletion({ text: summaries.join('\n') });
  await saveInPinecone(PINECONE_NAMESPACES.SUMMARIES, text, { url, summary });
  return summary;
};

export const getSummary = async (
  url: string,
  pageContent?: PageContent
): Promise<string | null> => {
  const results = await searchInPinecone(
    PINECONE_NAMESPACES.SUMMARIES,
    pageContent?.textContent || pageContent?.content || '',
    {
      url: { $eq: url },
    },
    1
  );
  if (results.matches && results.matches.length > 0) {
    const metadata = results.matches[0].metadata as SummaryVectorMetadata;
    return metadata.summary || null;
  }

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
  const summary = await getSummaryCompletion({ url, text });
  return summary;
};
