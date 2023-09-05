import express from 'express';
import {
  getLatestConversationController,
  createConversationController,
  createNewConversationMessageController,
} from './controllers/conversations';

const router = express.Router();

router.get('/latest_conversation', getLatestConversationController);
router.post('/messages/new', createNewConversationMessageController);
router.post('/conversations/new', createConversationController);

export default router;
