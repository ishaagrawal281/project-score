// Auto-fix invalid URLs that might be set in Vercel without http:// or https://
if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.startsWith('http')) {
  process.env.NEXTAUTH_URL = `https://${process.env.NEXTAUTH_URL}`;
}
if (process.env.NEXT_PUBLIC_BACKEND_URL && !process.env.NEXT_PUBLIC_BACKEND_URL.startsWith('http')) {
  process.env.NEXT_PUBLIC_BACKEND_URL = `https://${process.env.NEXT_PUBLIC_BACKEND_URL}`;
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
}

module.exports = nextConfig

