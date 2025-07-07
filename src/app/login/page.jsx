'use client'; // Mark as client component due to useState and axios

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [redirect, setRedirect] = useState(false);
  const { setIsAuthenticated } = useAuth();
  const router = useRouter();

async function handleLoginSubmit(ev) {
  ev.preventDefault();
  try {
    const response = await axios.post('/api/login', { username, password });

    const { user } = response.data;

    setIsAuthenticated(true);

    router.push('/');
  } catch (e) {
    console.error('❌ Login Failed:', e);
    alert('Login Failed');
  }
}


  useEffect(() => {
    if (redirect) {
      router.push('/'); 
    }
  }, [redirect]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-850 to-blue-950 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-6 sm:p-8 border border-gray-700">
        <form onSubmit={handleLoginSubmit} className="space-y-6">
          <h1 className="text-4xl font-bold text-white text-center">Login</h1>
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-300">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
            />
          </div>
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6+ characters"
              className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
            />
          </div>
          <button className="w-full px-4 py-3 bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-500 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg">
            Log In
          </button>
          <div className="text-center text-gray-300 text-sm">
            Don't have an account?{' '}
            <Link href="/signup" className="text-cyan-400 hover:text-cyan-300 underline transition-colors duration-200">
              Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;