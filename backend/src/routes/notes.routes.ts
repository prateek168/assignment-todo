import express from 'express';
import {
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote
} from '../controllers/notes.controller';
import { asyncHandler } from '../utils/asyncHandler';
import { requireAuth } from '../middlewares/auth.middleware';


const router = express.Router();

router.get('/', asyncHandler(requireAuth), asyncHandler(getNotes));
router.get('/:id', asyncHandler(requireAuth), asyncHandler(getNote));
router.post('/', asyncHandler(requireAuth), asyncHandler(createNote));
router.put('/:id', asyncHandler(requireAuth), asyncHandler(updateNote));
router.delete('/:id', asyncHandler(requireAuth), asyncHandler(deleteNote));

export default router;
