import AuthLayout from "../components/auth/AuthLayout";

const Login = () => {
  return (
    <AuthLayout>
      <div className="space-y-6">
        {/* Heading */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
          <p className="mt-2 text-gray-600">
            Sign in to your account to continue.
          </p>
        </div>

        {/* Placeholder for LoginForm component */}
        <div className="space-y-4">
          {/* LoginForm component will be inserted here in future PR */}
          <div className="h-48 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center">
            <p className="text-slate-500 text-sm">LoginForm component coming in next PR</p>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Login;