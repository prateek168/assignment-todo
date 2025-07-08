import { Request, Response, NextFunction } from 'express';
import prisma from '../config/client';
import { signToken } from '../utils/jwt';

function getUserId(req: Request): string | null {
  // @ts-ignore
  return req.user?.id || null;
}

function asyncHandler(fn: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export const getNotes = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    const notes = await prisma.note.findMany({ 
      where: { userId },
      orderBy: { createdAt: 'desc' } 
    });
    
    res.json({ notes });
  } catch (err) {
    console.error('getNotes error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getNote = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    const { id } = req.params;
    const note = await prisma.note.findFirst({ where: { id, userId } });
    
    if (!note) return res.status(404).json({ error: 'Note not found' });
    
    res.json({ note });
  } catch (err) {
    console.error('getNote error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createNote = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    const { title, description } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }
    
    const note = await prisma.note.create({
      data: { title, description, userId }
    });
    
    res.status(201).json({ note });
  } catch (err) {
    console.error('createNote error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateNote = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    const { id } = req.params;
    const { title, description } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }
    
    // First check if the note exists and belongs to the user
    const existingNote = await prisma.note.findFirst({ where: { id, userId } });
    if (!existingNote) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    // Update the note
    const updatedNote = await prisma.note.update({
      where: { id },
      data: { title, description }
    });
    
    res.json({ note: updatedNote, message: 'Note updated successfully' });
  } catch (err) {
    console.error('updateNote error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


export const deleteNote = async (req: Request, res: Response) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    
    const { id } = req.params;
    
    // First check if the note exists and belongs to the user
    const existingNote = await prisma.note.findFirst({ where: { id, userId } });
    if (!existingNote) {
      return res.status(404).json({ error: 'Note not found' });
    }
    
    // Delete the note
    await prisma.note.delete({ where: { id } });
    
    res.json({ message: 'Note deleted successfully' });
  } catch (err) {
    console.error('deleteNote error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};