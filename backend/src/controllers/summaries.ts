import { Request, Response } from 'express';
import { getSummary } from '../lib/summaries';

export const createNewSummaryController = async (req: Request, res: Response) => {
  const { url, pageContent } = req.body;
  const summary = await getSummary(url, pageContent);

  if (!summary) {
    res.send({
      success: false,
      error: 'Could not summarize the provided URL.',
    });
    return;
  }

  res.send({
    success: true,
    summary,
  });
};
