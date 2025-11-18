"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import SmallLoader from "./small_loader";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          password,
          isSignup: false,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Welcome back!", { duration: 2000 });
        
        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      } else {
        if (res.status === 401) {
          toast.error("Invalid email or password");
        } else {
          toast.error(data.error || "Login failed");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-[#495C79] rounded-lg p-2.5 w-full bg-[#F3F4F7] text-[#171D26] text-sm focus:outline-none focus:border-[#3D4C63] focus:ring-1 focus:ring-[#3D4C63]"
            required
            disabled={loading}
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm text-gray-600 mb-1">
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-[#495C79] rounded-lg p-2.5 w-full bg-[#F3F4F7] text-[#171D26] text-sm pr-10 focus:outline-none focus:border-[#3D4C63] focus:ring-1 focus:ring-[#3D4C63]"
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
              disabled={loading}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className={`bg-[#3D4C63] text-white px-4 py-2.5 rounded-lg w-full font-medium tracking-tight transition-all duration-200 ${
            loading 
              ? "opacity-50 cursor-not-allowed" 
              : "hover:bg-[#495C79] hover:shadow-md active:scale-[0.98]"
          }`}
          disabled={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <SmallLoader />
              Logging In...
            </span>
          ) : (
            "Login"
          )}
        </button>

        {/* Helper Text */}
        <div className="text-center pt-2">
          <p className="text-xs text-gray-500">
            Don't have an account?{" "}
            <span className="text-gray-400">Contact your administrator</span>
          </p>
        </div>
      </form>
    </div>
  );
}