'use client'

import { useEffect, useRef, useCallback, useContext, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ResumeUpload from './ResumeUpload'
import { AppContext } from '../context/AppContext'
import { useSession, signOut } from 'next-auth/react'

const Body = () => {
  const { resumeData, setResumeData, atsCompleted, setAtsCompleted, showPreview, setShowPreview } =
    useContext(AppContext)

  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated'

  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  const fileInputRef = useRef(null)
  const isSettingFile = useRef(false)
  const router = useRouter()

  useEffect(() => {
    console.log(
      'Body.jsx - resumeData:',
      resumeData,
      'atsCompleted:',
      atsCompleted,
      'showPreview:',
      showPreview
    )
  }, [resumeData, atsCompleted, showPreview])

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }
  const handleDragLeave = () => setIsDragging(false)

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    if (isSettingFile.current) return
    isSettingFile.current = true
    const file = e.dataTransfer.files[0]
    if (file) {
      setSelectedFile(file)
      setResumeData(null)
      setShowPreview(false)
    }
    setTimeout(() => {
      isSettingFile.current = false
    }, 100)
  }, [])

  const handleFileChange = useCallback((e) => {
    if (isSettingFile.current) return
    isSettingFile.current = true
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setResumeData(null)
      setShowPreview(false)
    }
    setTimeout(() => {
      isSettingFile.current = false
    }, 100)
  }, [])

  const handleClick = () => fileInputRef.current?.click()

  const handleUploadSuccess = (data) => {
    console.log('Upload Success - data:', data)
    if (data) setResumeData(data)
    setSelectedFile(null)
    setIsUploading(false)
  }

  const handleShowPreview = () => {
    if (resumeData && !atsCompleted) setShowPreview(true)
  }

  return (
    <div className="w-full rounded-xl bg-slate-900/60 backdrop-blur-md shadow-lg p-6 sm:p-8 border border-slate-800">
      {!resumeData && (
        <>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx"
          />

          <div
            className={`border-2 border-dashed rounded-lg p-6 cursor-pointer transition-all duration-300
              ${
                isDragging
                  ? 'border-indigo-400 ring-1 ring-indigo-400/30 bg-slate-800/60'
                  : 'border-slate-700 hover:border-indigo-300 hover:bg-slate-800/70'
              }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleClick}
          >
            <div className="flex flex-col items-center gap-3">
              <svg
                viewBox="0 0 24 24"
                className="w-16 h-16 text-indigo-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.25"
              >
                <path
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6H16a5 5 0 011 9.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M12 22V10m0 0l-3 3m3-3l3 3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-slate-200 text-lg font-medium">
                {isDragging
                  ? 'Release to Upload Your Resume'
                  : selectedFile
                  ? `Selected: ${selectedFile.name}`
                  : 'Click or Drag & Drop Your Resume Here'}
              </span>
              <span className="text-sm text-slate-400">Please upload a PDF file</span>
            </div>
          </div>
        </>
      )}

      {isAuthenticated && (
        <div className="mt-4">
          <ResumeUpload selectedFile={selectedFile} onUploadSuccess={handleUploadSuccess} />
        </div>
      )}

      <div className="mt-6 text-center">
        {resumeData && !showPreview && !atsCompleted && (
          <button
            onClick={handleShowPreview}
            className="w-full px-6 py-3 rounded-md border border-indigo-500/30 
                        bg-slate-800 text-indigo-300 hover:bg-slate-700 
                        font-medium transition-all duration-300"
          >
            Show Resume Preview
          </button>
        )}

        <p className="text-slate-400 mb-2 mt-2">
          {isAuthenticated ? 'You are logged in' : 'Not logged in yet'}
        </p>

        {!isAuthenticated ? (
          <Link
            href="/login"
            className="inline-block px-6 py-2 text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Log In
          </Link>
        ) : (
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="inline-block px-6 py-2 text-slate-300 hover:text-slate-200 transition-colors cursor-pointer"
          >
            Log Out
          </button>
        )}
      </div>
    </div>
  )
}

export default Body
