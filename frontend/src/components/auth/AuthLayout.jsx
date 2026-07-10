import AuthHero from "./AuthHero";

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="grid lg:grid-cols-[1fr_1fr] min-h-screen">
        {/* Left side - Hero section */}
        <AuthHero />

        {/* Right side - Auth card */}
        <div className="flex flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
              {children}
            </div>

            {/* Footer text for mobile */}
            <p className="mt-6 text-center text-sm text-slate-600 lg:hidden">
              Secure. Cloud. Share.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;