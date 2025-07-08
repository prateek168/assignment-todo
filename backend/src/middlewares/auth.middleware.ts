import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { z } from 'zod';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  // Check for token in cookies 
  const token = req.cookies.token;  
  
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    (req as any).user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}