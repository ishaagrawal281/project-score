"use client";

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import GlobalPromptHandler from './GlobalPromptHandler';

const FetchInterceptor = ({ children }) => {
  const { data: session } = useSession();

  useEffect(() => {
    // Store the original fetch function
    const originalFetch = window.fetch;

    // Create an intercepted fetch function
    window.fetch = async function(...args) {
      const [resource, config = {}] = args;
      
      // Clone the config to avoid mutating the original
      const newConfig = { ...config };
      newConfig.headers = { ...(config?.headers || {}) };
      
      const url = typeof resource === 'string' ? resource : resource.url;
      
      // Add authorization header if it's an API call
      if (url && (url.includes('/api/') || url.includes('localhost:5000') || url.includes('onrender.com'))) {
        let token = null;
        
        // First try to get token from session
        if (session?.accessToken) {
          token = session.accessToken;
        } else {
          // Fallback to localStorage
          try {
            token = localStorage.getItem('token');
          } catch (e) {
            // ignore
          }
        }
        
        if (token) {
          newConfig.headers['Authorization'] = `Bearer ${token}`;
        }
      }

      try {
        // Call the original fetch with the modified config
        const response = await originalFetch(resource, newConfig);
        
        // Handle unauthorized responses
        if (response.status === 401) {
          console.warn('[FetchInterceptor] Unauthorized request, token may be expired');
          // Token is likely expired, let NextAuth handle the refresh
        }
        
        return response;
      } catch (error) {
        console.error('[FetchInterceptor] Fetch error:', error);
        throw error;
      }
    };

    // Cleanup: restore original fetch on unmount
    return () => {
      window.fetch = originalFetch;
    };
  }, [session]);

  return <GlobalPromptHandler>{children}</GlobalPromptHandler>;
};

export default FetchInterceptor;
