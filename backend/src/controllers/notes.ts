import { Request, Response } from 'express';
import { createNote, getNotes } from '../lib/notes';

export const searchNotesController = async (req: Request, res: Response) => {
  const { url, query } = req.body;
  const relevantContent = await getNotes(query, url);

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

export const createNewNoteController = async (req: Request, res: Response) => {
  const { text, url } = req.body;
  const note = await createNote(text, url);

  if (!note) {
    res.send({
      success: false,
      error: 'Could not create the note.',
    });
    return;
  }

  res.send({
    success: true,
    note,
  });
};
