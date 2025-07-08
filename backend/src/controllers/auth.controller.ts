import { Request, Response, NextFunction } from 'express';
import { generateOTP } from '../utils/otp';
import { signToken } from '../utils/jwt';
import { sendOtpSchema, verifyOtpSchema } from '../validators/auth.schema';
import { sendMail } from '../config/mailer';
import prisma from '../config/client'; 
import jwt from 'jsonwebtoken';

function asyncHandler(fn: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export const sendOtp = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { email,  mode } = req.body;
    
    if (!mode || !['signin', 'signup'].includes(mode)) {
      return res.status(400).json({ error: 'Mode is required and must be either "signin" or "signup"' });
    }


    const existingUser = await prisma.user.findUnique({ where: { email } });
    
    if (mode === 'signin') {
      // For signin -- user must exist
      if (!existingUser) {
        return res.status(404).json({ error: 'User not found. Please sign up first.' });
      }
      
      // Generate OTP for existing user
      const otp = generateOTP();
      const name = existingUser.name;
      const dob =existingUser.dob
      await prisma.user.update({
        where: { email },
        data: {
          otp,
          otpExpiry: new Date(Date.now() + 5 * 60 * 1000)
        }
      });
      
      await sendMail(email, otp);
      res.json({ message: 'OTP sent successfully for signin' });
      
    } else if (mode === 'signup') {
      // For signup --user must not exist
      if (existingUser) {
        return res.status(409).json({ error: 'User already exists. Please sign in instead.' });
      }
      const { email , mode , name , dob }=req.body
      if (!name || !dob) {
        return res.status(400).json({ error: 'Name and date of birth are required for signup' });
      }
      
      // Generate OTP for new user
      const otp = generateOTP();
      
      await prisma.user.create({
        data: {
          email,
          name ,
          dob: new Date(dob),
          isOAuth: false,
          otp,
          otpExpiry: new Date(Date.now() + 5 * 60 * 1000)
        }
      });
      
      await sendMail(email, otp);
      res.json({ message: 'OTP sent successfully for signup' });
    }
    
  } catch (err) {
    console.error('sendOtp error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const verifyOtp = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;
    const parsed = verifyOtpSchema.safeParse({ email, otp });
    if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.errors });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.otp !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }

    await prisma.user.update({
      where: { email },
      data: {
        otp: null,
        otpExpiry: null
      }
    });

    const token = signToken({ id: user.id, email: user.email });

    res.cookie("token", token, {
      httpOnly: true,       
      secure: true,       
      sameSite: 'none',      
      maxAge: 24 * 60 * 60 * 1000 
    });

    res.json({ 
      token, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        dob: user.dob
      },
      message: 'Authentication successful'
    });
  } catch (err) {
    console.error('verifyOtp error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const isLoggedIn = asyncHandler(async (req: Request, res: Response) => {
  try {
    const token = req.cookies.token;
    console.log(token)
    if (!token) {
      return res.status(401).json({ 
        isLoggedIn: false, 
        error: 'No authentication token found' 
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.id }
      });
      
      console.log(user)
      if (!user) {
        res.clearCookie('token');
        return res.status(401).json({ 
          isLoggedIn: false, 
          error: 'User not found' 
        });
      }

      res.json({
        isLoggedIn: true,
        user
      });
      
    } catch (jwtError) {
      res.clearCookie('token');
      return res.status(401).json({ 
        isLoggedIn: false, 
        error: 'Invalid or expired token' 
      });
    }
    
  } catch (err) {
    console.error('isLoggedIn error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const oauthCallback = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  try {
    const user = req.user as any;
    if (!user || !user.id || !user.email) {
      res.status(400).json({ error: 'Invalid user object from OAuth' });
      return;
    }
    const homepage: string = process.env.HOMEPAGE_URL!;
    const token = signToken({ id: user.id, email: user.email });
    res.cookie("token", token, {
      httpOnly: true,       
      secure: true,       
      sameSite: 'none',   
      maxAge: 24 * 60 * 60 * 1000  
    });
    res.redirect(`${homepage}`);
  } catch (err) {
    console.error('oauthCallback error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  try {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    console.error('logout error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const findUser = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { email, id } = req.query;

    if (!email && !id) {
      return res.status(400).json({ error: 'Email or ID is required to find user' });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          email ? { email: String(email) } : undefined,
          id ? { id: Number(id) } : undefined,
        ].filter(Boolean) as any
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (err) {
    console.error('findUser error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});