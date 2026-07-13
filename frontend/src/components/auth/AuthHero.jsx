import { ShieldCheck, Cloud, Share2 } from "lucide-react";

const AuthHero = () => {
  return (
    <div className="hidden lg:flex flex-col justify-between h-full p-12 text-white relative overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-blue-500">
      {/* Decorative circles */}
      <div className="absolute w-96 h-96 bg-white/10 rounded-full -top-24 -left-24 blur-3xl"></div>
      <div className="absolute w-56 h-56 bg-white/5 rounded-full bottom-0 right-0 blur-2xl"></div>

      {/* Content */}
      <div className="relative z-10">
        {/* Logo placeholder */}
        <div className="w-12 h-12 bg-white/20 rounded-xl mb-8 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">V</span>
        </div>

        <h1 className="text-5xl font-bold mb-4 tracking-tight">
          Document Vault
        </h1>

        <p className="text-indigo-100 text-lg leading-8 max-w-lg">
          Securely store, manage, and share your academic documents with complete peace of mind. Generate temporary links for instant sharing.
        </p>
      </div>

      {/* Features */}
      <div className="relative z-10 flex gap-12">
        <div className="flex flex-col items-start gap-3">
          <div className="p-3 bg-white/10 rounded-lg">
            <ShieldCheck size={24} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Secure</h3>
            <p className="text-indigo-100 text-sm">Military-grade encryption</p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3">
          <div className="p-3 bg-white/10 rounded-lg">
            <Cloud size={24} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Cloud</h3>
            <p className="text-indigo-100 text-sm">Access anywhere, anytime</p>
          </div>
        </div>

        <div className="flex flex-col items-start gap-3">
          <div className="p-3 bg-white/10 rounded-lg">
            <Share2 size={24} className="text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Share</h3>
            <p className="text-indigo-100 text-sm">Temporary, expiring links</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthHero;