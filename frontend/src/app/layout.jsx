import { AuthProvider } from '../context/AuthContext';
import ErrorBoundary from '../components/ErrorBoundary';
import './globals.css';

/**
 * CONCEPT: JavaScript — Hoisting (Frontend)
 *
 * The hoisting demo module is imported here and invoked conditionally
 * in development mode. It logs demonstrations of JavaScript hoisting
 * behaviors (function declarations, var, let/const TDZ, classes) to
 * the browser console.
 *
 * NOTE: This import uses a dynamic import() inside a client component
 * (HoistingLogger below) because the root layout is a server component
 * and cannot use browser APIs like console.group().
 */

export const metadata = {
  title: 'DocVault | Secure Digital Document Management',
  description: 'An enterprise-grade secure digital document management platform.',
}

/**
 * HoistingLogger — Client component that runs the hoisting demo in dev mode.
 * Separated as a client component because the root layout is a server component.
 */
function HoistingLogger() {
  // This is a server component — we use a script tag to load the demo
  // on the client side in development mode only
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          if (typeof window !== 'undefined') {
            // HOISTING DEMO: Run on first load in development mode
            // This demonstrates JavaScript hoisting concepts in the browser console
            window.addEventListener('load', function() {
              if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
                import('/src/utils/hoistingDemo.js').then(function(mod) {
                  if (mod && mod.runHoistingDemos) {
                    mod.runHoistingDemos();
                  }
                }).catch(function() {
                  // Silently ignore if module cannot be loaded (production build)
                });
              }
            }, { once: true });
          }
        `
      }}
    />
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ErrorBoundary>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ErrorBoundary>
        {/* HOISTING DEMO: Logs hoisting behavior examples to console in dev mode */}
        <HoistingLogger />
      </body>
    </html>
  );
}
