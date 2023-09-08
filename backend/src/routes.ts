import express from 'express';
import {
  getLatestConversationController,
  createConversationController,
  createNewConversationMessageController,
} from './controllers/conversations';
import { createNewSummaryController } from './controllers/summaries';
import { readPageController } from './controllers/read';
import { createNewNoteController, searchNotesController } from './controllers/notes';

const router = express.Router();

router.get('/health-check', (req, res) => {
  res.send('OK');
});

router.post('/messages/new', createNewConversationMessageController);
router.get('/conversations/latest', getLatestConversationController);
router.post('/conversations/new', createConversationController);

router.post('/summarize', createNewSummaryController);
router.post('/read', readPageController);

router.post('/notes', createNewNoteController);
router.post('/notes/search', searchNotesController);

export default router;
