import OpenAI from 'openai';
import { Config } from './config';
import { Readability, isProbablyReaderable } from '@mozilla/readability';
import { JSDOM } from 'jsdom';
import { PageContent } from '../types';
import { encodingForModel, TiktokenModel } from 'js-tiktoken';
import { TokenTextSplitter } from 'langchain/text_splitter';

// Summary model has 16k tokens limit, leave some room for the prompt
const MAX_TOKENS = 15000;

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

const getSummaryCompletion = async ({ text }: { text: string }) => {
  // Measure the number of tokens for the text
  const encoding = encodingForModel(Config.SUMMARY_MODEL as TiktokenModel);
  const encodedText = encoding.encode(text);
  const numTokens = encodedText.length;

  if (numTokens <= MAX_TOKENS) {
    return await getCompletion({ text });
  }

  // If the text is too long, split it into chunks and summarize each chunk
  const splitter = new TokenTextSplitter({
    encodingName: 'cl100k_base',
    chunkSize: MAX_TOKENS,
    chunkOverlap: 0,
  });

  const output = await splitter.createDocuments([text]);

  const summaries = [];
  for (const doc of output) {
    const summary = await getCompletion({
      text: doc.pageContent,
    });
    summaries.push(summary);
  }

  return getCompletion({ text: summaries.join('\n') });
};

const getUrlText = async (htmlString: string) => {
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

export const getSummary = async (pageContent?: PageContent): Promise<string | null> => {
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
  const summary = await getSummaryCompletion({ text });
  return summary;
};
