'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signIn } from 'next-auth/react'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const router = useRouter()

  async function handleLoginSubmit(ev) {
    ev.preventDefault()
    setError(null)

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    })

    if (result?.error) {
      setError('❌ Invalid credentials')
    } else {
      router.push('/')
    }
  }

  return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-900/70 px-4 pb-15">
      <div className="w-full max-w-xs rounded-xl bg-slate-900/60 backdrop-blur-md shadow-lg p-6 border border-slate-800">
        <form onSubmit={handleLoginSubmit} className="space-y-5">
          <h1 className="text-2xl font-bold text-white text-center">Login</h1>

          {/* Email */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-slate-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition text-sm"
              required
            />
          </div>

          {/* Password */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-slate-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6+ characters"
              className="p-2.5 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 transition text-sm"
              required
            />
          </div>

          {/* Credentials Login */}
          <button
            type="submit"
            className="w-full px-4 py-2.5 rounded-md border border-indigo-500/30 bg-slate-800 text-indigo-300 hover:bg-slate-700 font-medium transition-all duration-300 text-sm"
          >
            Log In
          </button>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        </form>

        {/* Divider */}
        <div className="flex items-center my-4">
          <hr className="flex-grow border-slate-700" />
          <span className="mx-2 text-slate-400 text-xs">OR</span>
          <hr className="flex-grow border-slate-700" />
        </div>

        {/* Google Login */}
          <button
            onClick={() => signIn('google', { callbackUrl: '/' })}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 
                      rounded-md border border-slate-700 bg-slate-800 
                      hover:bg-slate-700 transition-all duration-300 text-sm text-slate-200"
          >
            <img
              src="/google-logo.png"
              alt="Google"
              className="w-5 h-5"
            />
            <span>Continue with Google</span>
          </button>


        <div className="text-center text-slate-400 text-xs mt-4">
          Don’t have an account?{' '}
          <Link href="/signup" className="text-indigo-400 hover:text-indigo-300 underline">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login
