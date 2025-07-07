'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const Signup = () => {
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const router = useRouter();
  const { setIsAuthenticated } = useAuth();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function signupUser(ev) {
    ev.preventDefault();
    try {
      const res = await axios.post('/api/signup', form, {
        withCredentials: true, // allow cookie to be se
      });

    
      setIsAuthenticated(true);

      alert('Signup successful! Redirecting...');
      router.push('/'); 
    } catch (error) {
      console.error('❌ Signup Failed:', error);
      alert(error?.response?.data?.error || 'Signup failed! Please try again.');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-850 to-blue-950 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-blur-md rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-6 sm:p-8 border border-gray-700">
        <form onSubmit={signupUser} className="space-y-6">
          <h1 className="text-4xl font-bold text-white text-center">Sign Up</h1>

          <div className="flex gap-x-4">
            <div className="flex flex-col w-1/2 space-y-2">
              <label className="text-sm font-medium text-gray-300">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Name"
                className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
              />
            </div>
            <div className="flex flex-col w-1/2 space-y-2">
              <label className="text-sm font-medium text-gray-300">Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Username"
                className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
              />
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-300">Email</label>
            <input
              type="text"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="6+ characters"
              className="p-3 bg-gray-700 border border-gray-600 rounded-lg text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all duration-200"
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-3 bg-gradient-to-r from-cyan-400 to-blue-600 text-white font-semibold rounded-lg hover:from-cyan-500 hover:to-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Sign Up
          </button>

          <div className="text-center text-gray-300 text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-cyan-400 hover:text-cyan-300 underline transition-colors duration-200">
              Log In
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
