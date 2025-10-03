import './globals.css'
import Providers from './providers'
import UserProfile from '../components/UserProfile'

export const metadata = {
  title: 'CVision',
  description: 'Resume Analyzer',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
        <Providers>
          <UserProfile />
          <main className="pt-16">{children}</main>
        </Providers>
      </body>
    </html>
  )
}
