import { AuthProvider } from '../context/AuthContext';
import ErrorBoundary from '../components/ErrorBoundary';
import './globals.css';

export const metadata = {
  title: 'DocVault - Secure Digital Lockbox',
  description: 'A secure digital document vault inspired by DigiLocker and Google Drive.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
