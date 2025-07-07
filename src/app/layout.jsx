import './globals.css';
import { AuthProvider } from '../context/AuthContext';
console.log("🧪 AuthProvider loaded?", AuthProvider);



export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}