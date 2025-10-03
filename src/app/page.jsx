'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { AppProvider } from '../context/AppContext'
import JobList from '../components/JobList'
import Body from '../components/Body'

export default function Home() {
  const { status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center h-screen text-slate-100">
        Checking authentication...
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return (
      <div className="flex items-center justify-center h-screen text-slate-100">
        Redirecting...
      </div>
    )
  }

  // ✅ If authenticated
  return (
    <AppProvider>
      <div className="w-full h-[calc(100vh-64px)] flex flex-col md:flex-row">
        {/* Left panel */}
        <div className="w-full md:w-1/2 md:h-full overflow-y-auto 
                        p-4 sm:p-6 bg-slate-900/70 
                        border-b md:border-b-0 md:border-r border-slate-800">
          <Body />
        </div>

        {/* Right panel */}
        <div className="w-full md:w-1/2 md:h-full overflow-y-auto 
                        p-4 sm:p-6 bg-slate-900/70">
          <JobList />
        </div>
      </div>
    </AppProvider>
  )
}
