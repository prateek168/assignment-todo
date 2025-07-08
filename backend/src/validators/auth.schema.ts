import { z } from 'zod';

export const sendOtpSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1, 'Name is required').optional(),
  dob: z.string().optional().refine(
    (val) => !val || !isNaN(Date.parse(val)),
    { message: 'dob must be a valid date string' }
  )
});

export const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string(),
  name: z.string().min(1, 'Name is required').optional(),
  dob: z.string().optional().refine(
    (val) => !val || !isNaN(Date.parse(val)),
    { message: 'dob must be a valid date string' }
  )
});
