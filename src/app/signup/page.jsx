'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import axios from 'axios'
import { signIn } from 'next-auth/react'

const Signup = () => {
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' })
  const [error, setError] = useState(null)
  const router = useRouter()

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  async function signupUser(ev) {
    ev.preventDefault()
    setError(null)

    try {
      await axios.post('/api/signup', form)

      const result = await signIn('credentials', {
        redirect: false,
        email: form.email,
        password: form.password,
      })

      if (result?.error) {
        setError('❌ Signup succeeded but auto-login failed. Please log in manually.')
        router.push('/login')
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('❌ Signup Failed:', error)
      setError(error?.response?.data?.error || 'Signup failed! Please try again.')
    }
  }

  return (
    <div className="min-h-[calc(100vh-64px)] w-full flex justify-center bg-slate-900/70 px-3 py-6">
      <div className="w-full max-w-sm self-start sm:self-center rounded-lg bg-slate-900/60 backdrop-blur-md shadow-md px-4 pb-5 border border-slate-800">
        <form onSubmit={signupUser} className="space-y-3">
          <h1 className="text-2xl font-bold text-white text-center pt-2">Sign Up</h1>

          {/* Name + Username */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs text-slate-300">Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Name"
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs text-slate-300">Username</label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="Username"
                className="w-full p-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              />
            </div>
          </div>

          {/* Email */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs text-slate-300">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="p-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              required
            />
          </div>

          {/* Password */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs text-slate-300">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="6+ characters"
              className="p-2 bg-slate-800 border border-slate-700 rounded-md text-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
              required
            />
          </div>

          {/* Signup Button */}
          <button
            type="submit"
            className="w-full px-4 py-2 rounded-md border border-indigo-500/30 bg-slate-800 text-indigo-300 hover:bg-slate-700 font-medium transition text-sm"
          >
            Sign Up
          </button>

          {error && <p className="text-red-400 text-xs text-center">{error}</p>}
        </form>

        {/* Divider */}
        <div className="flex items-center my-3">
          <hr className="flex-grow border-slate-700" />
          <span className="mx-2 text-slate-400 text-xs">OR</span>
          <hr className="flex-grow border-slate-700" />
        </div>

        {/* Google Login */}
        <button
          onClick={() => signIn('google', { callbackUrl: '/' })}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-slate-700 bg-slate-800 hover:bg-slate-700 transition text-sm text-slate-200"
        >
          <img src="/google-logo.png" alt="Google" className="w-5 h-5" />
          <span>Continue with Google</span>
        </button>

        {/* Footer */}
        <div className="text-center text-slate-400 text-xs mt-3">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Signup
