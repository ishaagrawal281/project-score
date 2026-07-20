import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'http://localhost:5000';

const exchangeGoogleToken = async (idToken) => {
  const response = await fetch(`${BACKEND}/api/auth/google`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken })
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Google authentication could not be completed.');
  }
  return data;
};

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password required');
        }

        try {
          const res = await fetch(`${BACKEND}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password
            })
          });

          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'Invalid credentials');
          }

          const data = await res.json();
          
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            accessToken: data.token
          };
        } catch (error) {
          throw new Error(error.message || 'Login failed');
        }
      }
    })
  ],
  pages: {
    signIn: '/login',
    error: '/login'
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.provider === 'google') {
        try {
          const data = await exchangeGoogleToken(account.id_token);
          token.accessToken = data.token;
          token.userId = data.user.id;
          token.picture = data.user.image;
          delete token.authError;
        } catch (error) {
          token.authError = 'GoogleAccountLinkingFailed';
          delete token.accessToken;
        }
      } else if (user) {
        token.accessToken = user.accessToken;
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.authError;
      if (session.user) {
        session.user.id = token.userId || token.sub;
        session.user.image = token.picture || session.user.image;
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production'
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-change-in-production'
});

export { handler as GET, handler as POST };
