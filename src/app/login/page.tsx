"use client";

import { useState } from "react";
import Container from "@/components/ui/container";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();

        try {
            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            if (res.ok) {
                toast.success("Login successful!");
                window.location.href = "/dashboard";
            } else {
                const error = await res.json().catch(() => null);
                toast.error(error?.message || "Login failed. Please try again.");
            }
        } catch (err) {
            toast.error("Something went wrong. Please try again.");
        }
    }

    return (
        <div className="h-[100dvh] flex items-center justify-center bg-[#171D26]">
            <Container>
                <div className="grid grid-cols-1 md:grid-cols-2 bg-white rounded-xl overflow-hidden shadow-lg">

                    {/* Left Side - Image */}
                    <div className="relative bg-gray-100 flex flex-col items-center justify-center">
                        <img
                            src="/images/img3.png"
                            alt="login_img1"
                            className="w-full h-[25vh] md:h-full object-cover"
                        />
                    </div>

                    {/* Right Side - Form */}
                    <div className="flex flex-col items-center justify-center p-6 w-full h-full">
                        <div className="w-full max-w-sm">
                            {/* Logo */}
                            <div className="flex items-center gap-2 mb-8">
                                <img
                                    src="/images/logo.png"
                                    alt="logo"
                                    className="h-5 w-5 object-cover"
                                />
                                <h4 className="text-md font-bold text-[#171D26] tracking-tighter">
                                    Kayron
                                </h4>
                            </div>

                            {/* Heading */}
                            <h2 className="text-4xl font-semibold mb-4 text-[#171D26] tracking-tighter">
                                Login to your account
                            </h2>
                            <p className="text-sm text-gray-600 mb-4">
                                Enter your email and password to login
                            </p>

                            {/* Form */}
                            <form onSubmit={handleLogin} className="space-y-4 w-full">
                                <input
                                    type="email"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="border border-[#495C79] rounded-lg p-2 block w-full bg-[#F3F4F7] text-[#171D26] text-sm"
                                    required
                                />

                                {/* Password Input with Toggle */}
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="border border-[#495C79] rounded-lg p-2 block w-full bg-[#F3F4F7] text-[#171D26] text-sm pr-10"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                                    >
                                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    className="bg-[#3D4C63] text-white px-4 py-2 rounded-lg w-full tracking-tighter hover:bg-[#495C79] transition-colors duration-200"
                                >
                                    Login
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </Container>
        </div>
    );
}
