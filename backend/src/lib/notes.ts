import { NoteVectorMetadata } from '../types';
import { searchInPinecone, saveInPinecone } from './pinecone';

export const getNotes = async (text: string, url?: string): Promise<object> => {
  const notes = await searchInPinecone('notes', text, {
    url: { $eq: url },
  });
  const matchingNotes = notes.matches?.map((match) => {
    const metadata = match.metadata as NoteVectorMetadata;
    return {
      id: match.id,
      url: metadata?.url,
      text: metadata?.text,
    };
  });

  return {
    success: true,
    notes: matchingNotes,
  };
};

export const createNote = async (text: string, url?: string): Promise<object> => {
  const noteData = {
    createdAt: new Date(),
    updatedAt: new Date(),
    text,
    url,
  };

  await saveInPinecone('notes', text, noteData);

  return {
    success: true,
    note: noteData,
  };
};
