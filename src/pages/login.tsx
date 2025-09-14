import { useState } from "react";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};
    if (!formData.email) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setSuccess(true);
      console.log("Login success:", formData);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white">
      <div className="w-full max-w-md bg-gray-900/80 backdrop-blur-md rounded-2xl shadow-2xl p-8">
        {!success ? (
          <>
            {/* Logo + Title */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-tr from-green-400 via-orange-500 to-yellow-400 flex items-center justify-center">
                <span className="text-2xl">👟</span>
              </div>
              <h1 className="text-3xl font-bold mt-4">
                <span className="text-green-400">GenZ</span>{" "}
                <span className="text-orange-400">Style</span>
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Your Style • Your Step
              </p>
            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Email */}
              <div>
                <label className="block text-sm font-medium mb-1">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-green-400 focus:outline-none"
                />
                {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:ring-2 focus:ring-orange-400 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-white"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-sm mt-1">{errors.password}</p>
                )}
              </div>

              {/* Options */}
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={formData.remember}
                    onChange={handleChange}
                    className="w-4 h-4 accent-green-400"
                  />
                  Remember Me
                </label>
                <a href="#" className="text-orange-400 hover:underline">
                  Forgot Password?
                </a>
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3 rounded-lg bg-gradient-to-r from-green-400 via-orange-500 to-yellow-400 font-semibold text-black hover:opacity-90 transition"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => console.log("Login with Google")}
                className="w-full mt-3 py-3 rounded-lg flex items-center justify-center gap-2 border border-gray-700 bg-gray-800 hover:bg-gray-700 transition"
              >
                <img
                  src="https://www.svgrepo.com/show/355037/google.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
                <span>Login with Google</span>
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-green-400 via-orange-500 to-yellow-400 flex items-center justify-center">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                className="text-black"
              >
                <path
                  d="M10 16l6 6 12-12"
                  stroke="black"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mt-6">WELCOME GenZStyle</h3>
            <p className="text-gray-400 mt-2">Step into your style...</p>
          </div>
        )}
      </div>
    </div>
  );
}
