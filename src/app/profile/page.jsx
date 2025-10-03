'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState(null)
  const [user, setUser] = useState(null)
  const [resumes, setResumes] = useState([])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setErr(null)
      try {
        const res = await fetch('/api/profile/summary')
        if (res.status === 401) {
          router.push('/login')
          return
        }
        if (!res.ok) throw new Error('Failed to load profile')
        const data = await res.json()
        setUser(data.user || null)
        setResumes(Array.isArray(data.resumes) ? data.resumes : [])
      } catch (e) {
        setErr(e.message || 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [router])

  if (loading) {
    return (
      <main className="min-h-[calc(100vh-64px)] w-full text-slate-100 px-6 py-10">
        <div className="max-w-4xl mx-auto text-base text-slate-300">Loading…</div>
      </main>
    )
  }

  return (
    <main className="min-h-[calc(100vh-64px)] w-full text-slate-100 px-6 py-10 bg-[#0f172ab3]">
      {/* Background subtle glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-10
        [background:
          radial-gradient(600px_600px_at_20%_8%,rgba(99,102,241,.10),transparent_60%),
          radial-gradient(520px_520px_at_85%_12%,rgba(56,189,248,.06),transparent_62%)]"
      />

      <div className="relative mx-auto max-w-4xl space-y-8">
        <h1 className="text-3xl font-bold">Profile</h1>

        {err && (
          <div className="text-base text-red-300 bg-red-500/10 border border-red-500/30 rounded-xl p-3">
            {err}
          </div>
        )}

        {/* User Info */}
        <section className="bg-slate-800/70 backdrop-blur-md rounded-2xl border border-slate-700 shadow-lg">
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-3">👤 User</h2>
            {user ? (
              <div className="text-base text-slate-200 space-y-1">
                <p><span className="text-slate-400">Name:</span> {user.name || '—'}</p>
                <p><span className="text-slate-400">Username:</span> {user.username || '—'}</p>
                <p><span className="text-slate-400">Email:</span> {user.email || '—'}</p>
              </div>
            ) : (
              <p className="text-base text-slate-400">Not logged in.</p>
            )}
          </div>
        </section>

        {/* Resumes + Analyses */}
        <div className="space-y-6">
          {resumes.length > 0 ? (
            resumes.map((resume) => (
              <section
                key={resume._id}
                className="bg-slate-800/70 backdrop-blur-md rounded-2xl border border-slate-700 shadow-lg overflow-hidden"
              >
                {/* Resume Header */}
                <div className="p-6 border-b border-slate-700">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
                        📄 <span className="truncate max-w-[26rem]">{resume.filename}</span>
                      </h2>
                      <p className="text-base text-slate-300">
                        Uploaded:{' '}
                        {resume.uploadedAt ? new Date(resume.uploadedAt).toLocaleString() : '—'}
                      </p>
                    </div>
                    {resume.fileUrl && (
                      <a
                        href={resume.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="shrink-0 inline-flex items-center gap-2 px-3 py-2 rounded-md
                          border border-indigo-500 text-indigo-300
                          bg-indigo-500/10 hover:bg-indigo-500/20
                          text-sm font-medium transition"
                      >
                        View / Download
                      </a>
                    )}
                  </div>
                </div>

                {/* Resume Analyses */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Analysis</h3>

                  {resume.analyses?.length === 0 ? (
                    <p className="text-base text-slate-400">No analysis yet.</p>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-4">
                      {resume.analyses.map((a) => {
                        const overall =
                          typeof a.overall === 'number' ? Math.round(a.overall) : null
                        const when = a.createdAt
                          ? new Date(a.createdAt).toLocaleString()
                          : '—'
                        const skills = Array.isArray(a.missingSkills) ? a.missingSkills : []

                        return (
                          <div
                            key={a._id || when}
                            className="rounded-2xl bg-slate-900/60 border border-slate-700 p-5 hover:border-indigo-500/40 transition"
                          >
                            {/* Header: date + big score */}
                            <div className="flex items-start justify-between mb-4">
                              <div className="text-base text-slate-400">{when}</div>
                              <div className="text-3xl font-extrabold tracking-tight text-indigo-400">
                                {overall !== null ? `${overall}%` : 'N/A'}
                              </div>
                            </div>

                            {/* Missing Skills */}
                            {skills.length > 0 ? (
                              <div>
                                <h4 className="text-base font-semibold text-slate-300 mb-2">
                                  Missing
                                </h4>
                                <ul className="list-disc list-outside pl-5 space-y-2 text-base text-slate-200 leading-relaxed">
                                  {skills.map((s, i) => (
                                    <li key={i}>{s}</li>
                                  ))}
                                </ul>
                              </div>
                            ) : (
                              <p className="text-base text-emerald-300">No major gaps detected.</p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </section>
            ))
          ) : (
            <p className="text-base text-slate-400">No resumes uploaded yet.</p>
          )}

          {/* Show placeholders if fewer than 3 resumes */}
          {resumes.length < 3 &&
            Array.from({ length: 3 - resumes.length }).map((_, i) => (
              <div
                key={`placeholder-${i}`}
                className="rounded-2xl bg-slate-900/40 border border-slate-700 p-8 text-center text-slate-500 italic"
              >
                No resume uploaded in this slot
              </div>
            ))}
        </div>
      </div>
    </main>
  )
}
