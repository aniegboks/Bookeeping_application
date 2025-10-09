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

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        toast.success("Login successful!", { duration: 2000 });
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 2000);
      } else {
        const error = await res.json().catch(() => null);
        toast.error(error?.message || "Login failed. Please try again.");
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }


  return (
    <form onSubmit={handleLogin} className="space-y-4 w-full">
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border border-[#495C79] rounded-lg p-2 block w-full bg-[#F3F4F7] text-[#171D26] text-sm"
        required
        disabled={loading}
      />

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

      <button
        type="submit"
        className={`bg-[#3D4C63] text-white px-4 py-2 rounded-lg w-full tracking-tighter transition-colors duration-200 ${loading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#495C79]"
          }`}
        disabled={loading}
      >
        {loading ? <span className="flex gap-2"><SmallLoader />Logging in...</span> : "Login"}
      </button>
    </form>
  );
}
