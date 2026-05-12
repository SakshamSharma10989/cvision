'use client'

import Link from 'next/link'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'
import { useSession, signOut } from 'next-auth/react'

export default function UserProfile() {
  const { data: session, status } = useSession()

  if (status === 'loading') return null

  return (
    <div
      className="
        fixed top-0 left-0 right-0 z-50
        flex items-center justify-between gap-3 px-3 sm:px-6 h-16
        bg-slate-900/70 backdrop-blur-md
        border-b border-slate-800 shadow-sm
      "
    >
      <h1 className="text-xl sm:text-2xl font-bold text-slate-100 flex items-center gap-2 shrink-0">
        <div className="p-1 rounded-full bg-slate-200">
          <img src="/icons/resume.png" alt="CVision" className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        CVision
      </h1>

      {status === 'authenticated' && (
        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className="min-w-0 flex items-center space-x-2 px-3 sm:px-4 py-1.5 rounded-lg
                       bg-slate-800/80 hover:bg-slate-700
                       border border-slate-700
                       text-slate-200 font-medium text-sm sm:text-base transition"
          >
            <FontAwesomeIcon icon={faUser} className="text-slate-300 text-sm" />
            <span className="max-w-24 sm:max-w-48 truncate">{session.user?.name}</span>
          </Link>
        </div>
      )}
    </div>
  )
}
