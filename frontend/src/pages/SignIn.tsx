import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function setCookie(name: string, value: string, days = 1) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [usingGoogle, setUsingGoogle] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const res = await fetch('http://localhost:3000/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          mode: 'signin' ,
          
        }),
        credentials: 'include',
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        if (res.status === 404) {
          setMessage('User not found. Please sign up first.');
          setMessageType('error');
          setTimeout(() => {
            navigate('/signup');
          }, 2000);
          return;
        }
        throw new Error(data.error || 'Failed to send OTP');
      }
      
      setOtpSent(true);
      setMessage('OTP sent to your email!');
      setMessageType('success');
    } catch (err: unknown) {
      setMessageType('error');
      if (err instanceof Error) {
        setMessage(err.message || 'Failed to send OTP');
      } else {
        setMessage('Failed to send OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    
    try {
      const res = await fetch('http://localhost:3000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
        credentials: 'include',
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Failed to verify OTP');
      }
      
      if (data.token) {
        setCookie('token', data.token);
      }
      
      setMessage('Signed in successfully! Redirecting...');
      setMessageType('success');
      
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (err: unknown) {
      setMessageType('error');
      if (err instanceof Error) {
        setMessage(err.message || 'Failed to verify OTP');
      } else {
        setMessage('Failed to verify OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setUsingGoogle(true);
    const googleAuthUrl = import.meta.env.VITE_GOOGLE_AUTH_URL;
    if (googleAuthUrl) {
      window.location.href = googleAuthUrl;
    } else {
      setMessage('Google authentication is not configured');
      setMessageType('error');
      setUsingGoogle(false);
    }
  };

  const handleResendOtp = async () => {
    setOtp('');
    setOtpSent(false);
    await handleSendOtp({ preventDefault: () => {} } as React.FormEvent);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="hidden md:flex flex-col absolute top-0 left-0 p-8 z-10">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="HD Logo" className="w-12 h-12" />
          <span className="text-2xl font-bold text-[black]">HD</span>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col md:flex-row h-screen w-full">
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-4 md:px-16 py-8 md:py-0">
          <div className="flex flex-row items-center gap-2 mb-6 md:hidden">
            <img src="/logo.png" alt="HD Logo" className="w-12 h-12" />
            <span className="text-2xl font-bold text-[black]">HD</span>
          </div>
          
          <div className="w-full max-w-md flex flex-col gap-6 bg-white rounded-xl p-6 md:p-10 md:bg-transparent md:shadow-none md:rounded-none">
            <div>
              <h2 className="text-3xl md:text-2xl font-bold mb-1 text-left">Sign in</h2>
              <p className="text-gray-600 mb-4 text-left">Sign in to enjoy the features of HD</p>
            </div>
            
            {!usingGoogle && !otpSent && (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="flex items-center justify-center gap-3 w-full py-3 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 transition text-lg font-medium mb-2 disabled:opacity-50"
              >
                <span className="w-6 h-6 flex items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g>
                      <path d="M21.805 10.023h-9.765v3.977h5.617c-.242 1.242-1.242 3.648-5.617 3.648-3.383 0-6.148-2.805-6.148-6.25s2.765-6.25 6.148-6.25c1.93 0 3.227.82 3.969 1.523l2.719-2.648c-1.719-1.617-3.945-2.617-6.688-2.617-5.523 0-10 4.477-10 10s4.477 10 10 10c5.742 0 9.547-4.023 9.547-9.719 0-.656-.07-1.148-.156-1.582z" fill="#4285F4"/>
                      <path d="M3.153 7.345l3.289 2.414c.898-1.719 2.523-2.809 4.598-2.809 1.18 0 2.242.406 3.078 1.078l2.312-2.25c-1.406-1.305-3.211-2.078-5.39-2.078-3.672 0-6.773 2.484-7.883 5.844z" fill="#34A853"/>
                      <path d="M12.999 22c2.617 0 4.813-.867 6.422-2.367l-2.969-2.422c-.828.617-1.898.984-3.453.984-2.672 0-4.938-1.805-5.75-4.242l-3.242 2.5c1.617 3.273 5.055 5.547 9.012 5.547z" fill="#FBBC05"/>
                      <path d="M21.805 10.023h-9.765v3.977h5.617c-.242 1.242-1.242 3.648-5.617 3.648-3.383 0-6.148-2.805-6.148-6.25s2.765-6.25 6.148-6.25c1.93 0 3.227.82 3.969 1.523l2.719-2.648c-1.719-1.617-3.945-2.617-6.688-2.617-5.523 0-10 4.477-10 10s4.477 10 10 10c5.742 0 9.547-4.023 9.547-9.719 0-.656-.07-1.148-.156-1.582z" fill="#4285F4"/>
                    </g>
                  </svg>
                </span>
                Sign in with Google
              </button>
            )}
            
            {usingGoogle && (
              <div className="flex flex-col items-center justify-center border border-gray-300 rounded-lg p-6 bg-white shadow">
                <span className="text-lg font-medium mb-2">Redirecting to Google...</span>
                <span className="text-gray-500 text-sm">Please complete sign-in with your Google account.</span>
              </div>
            )}
            
            {!usingGoogle && (
              <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="flex flex-col gap-5">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="block w-full px-4 pt-6 pb-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#367AFF] text-lg bg-transparent"
                    placeholder=" "
                    disabled={otpSent || loading}
                  />
                  <label className="absolute left-3 -top-3 bg-white px-1 text-sm text-gray-500">Email</label>
                </div>
                
                {otpSent && (
                  <div className="relative">
                    <input
                      type="text"
                      value={otp}
                      onChange={e => setOtp(e.target.value)}
                      required
                      maxLength={6}
                      className="block w-full px-4 pt-6 pb-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#367AFF] text-lg bg-transparent"
                      placeholder=" "
                      disabled={loading}
                    />
                    <label className="absolute left-3 -top-3 bg-white px-1 text-sm text-gray-500">OTP</label>
                  </div>
                )}
                
                <button 
                  type="submit" 
                  disabled={loading}
                  className="bg-[#367AFF] rounded-lg text-lg text-white py-3 w-full mt-2 disabled:opacity-50"
                >
                  {loading ? 'Please wait...' : (otpSent ? 'Sign in' : 'Get OTP')}
                </button>
                
                {otpSent && (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-[#367AFF] underline text-sm disabled:opacity-50"
                  >
                    Resend OTP
                  </button>
                )}
              </form>
            )}
            
            {message && (
              <div className={`text-center mt-2 ${messageType === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </div>
            )}
            
            <div className="text-center mt-2">
              <span className="text-gray-600">Don't have an account? </span>
              <button 
                onClick={() => navigate('/signup')}
                className="text-[#367AFF] underline font-medium"
              >
                Sign up
              </button>
            </div>
          </div>
        </div>
        
        <div className="hidden md:flex w-1/2 h-full p-2 items-center justify-center bg-white">
          <img src="/Hero.jpg" alt="Hero" className="object-cover w-full h-full rounded-3xl shadow-xl" />
        </div>
      </div>
    </div>
  );
};

export default SignIn;