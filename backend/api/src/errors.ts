import { Request, Response } from 'express';
import * as logger from 'firebase-functions/logger';

export const errorHandler = (err: Error, _req: Request, res: Response) => {
  switch (err.name) {
    case 'BadRequestError':
      return res.status(400).json({ error: 'Bad Request', message: err.message });
    case 'UnauthorizedError':
      return res.status(401).json({ error: 'Unauthorized', message: err.message });
    case 'ForbiddenError':
      return res.status(403).json({ error: 'Forbidden', message: err.message });
    case 'NotFoundError':
      return res.status(404).json({ error: 'Not Found', message: err.message });
    case 'UnprocessableEntityError':
      return res.status(422).json({ error: 'Unprocessable Entity', message: err.message });
    default:
      logger.error(err.stack);
      return res.status(500).json({
        error: 'Internal Server',
        message: 'Sorry, there seems to have been an issue with our service. Please try again.',
      });
  }
};
