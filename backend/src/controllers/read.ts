import { Request, Response } from 'express';
import { readContents } from '../lib/read';

export const readPageController = async (req: Request, res: Response) => {
  const { url, query, pageContent } = req.body;
  const relevantContent = await readContents(url, query, pageContent);

  if (!relevantContent) {
    res.send({
      success: false,
      error: 'Could not find relevant content for the URL.',
    });
    return;
  }

  res.send({
    success: true,
    relevantContent,
  });
};
