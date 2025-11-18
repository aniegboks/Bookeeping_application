"use client";

import { useState } from "react";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import SmallLoader from "./small_loader";

interface LoginPayload {
  email: string;
  password: string;
  name?: string;
  role_code?: string;
}

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewUserFields, setShowNewUserFields] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const payload: LoginPayload = { email, password };
      
      // Include optional fields if provided
      if (name.trim()) payload.name = name.trim();
      if (showNewUserFields) payload.role_code = "user"; // Default role for new users

      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        
        if (data.isNewUser) {
          toast.success("Welcome! Your account has been created.", { 
            duration: 3000,
            icon: "🎉",
          });
        } else {
          toast.success("Welcome back!", { duration: 2000 });
        }
        
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      } else {
        const error = await res.json().catch(() => null);
        
        // If error suggests user needs more info, show new user fields
        if (error?.message?.includes("not found") || error?.message?.includes("does not exist")) {
          setShowNewUserFields(true);
          toast.error("Account not found. Please provide your name to create one.");
        } else {
          toast.error(error?.message || "Login failed. Please try again.");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4 w-full">
      {/* Email */}
      <div>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border border-[#495C79] rounded-lg p-2 block w-full bg-[#F3F4F7] text-[#171D26] text-sm"
          required
          disabled={loading}
        />
      </div>

      {/* Password */}
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border border-[#495C79] rounded-lg p-2 block w-full bg-[#F3F4F7] text-[#171D26] text-sm pr-10"
          required
          disabled={loading}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
          disabled={loading}
        >
          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>

      {/* Name (shown for new users or if toggled) */}
      {showNewUserFields && (
        <div className="animate-slideDown">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-[#495C79] rounded-lg p-2 block w-full bg-[#F3F4F7] text-[#171D26] text-sm"
            required={showNewUserFields}
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            We&apos;ll create an account for you automatically
          </p>
        </div>
      )}

      {/* Toggle New User Fields */}
      {!showNewUserFields && (
        <button
          type="button"
          onClick={() => setShowNewUserFields(true)}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
          disabled={loading}
        >
          <UserPlus size={14} />
          First time? Click here
        </button>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        className={`bg-[#3D4C63] text-white px-4 py-2 rounded-lg w-full tracking-tighter transition-colors duration-200 ${
          loading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#495C79]"
        }`}
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <SmallLoader />
            {showNewUserFields ? "Creating account..." : "Logging in..."}
          </span>
        ) : (
          showNewUserFields ? "Create Account & Login" : "Login"
        )}
      </button>

      {/* Animation */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </form>
  );
}