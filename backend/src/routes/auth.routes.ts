import express from 'express';
import passport from '../config/passport';
import { sendOtp, verifyOtp, oauthCallback, logout, findUser, isLoggedIn } from '../controllers/auth.controller';
import cors from 'cors';

const router = express.Router();

// OTP endpoints
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.get('/find-user',findUser);
router.get('/is-loggedin',isLoggedIn);



// OAuth endpoints
router.get('/google', passport.authenticate('google', { scope: ['email', 'profile'] }));

router.get('/google/callback', passport.authenticate('google', {
  session: false,
  failureRedirect: '/login',
}), oauthCallback);

// Logout endpoint
router.post('/logout', logout);

export default router;
