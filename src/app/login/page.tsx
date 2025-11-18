"use client";

import Container from "@/components/ui/container";
import UnifiedAuthForm from "@/components/ui/unified_auth_form";
import Image from "next/image";

export default function LoginPage() {
  return (
    <div className="h-screen w-screen flex overflow-hidden bg-[#F3F4F7]">
      {/* Full Screen Grid Container */}
      <div className="w-full h-full grid grid-cols-1 md:grid-cols-2">
        
        {/* Left Section - Image with Dark Overlay */}
        <div
          className="hidden md:block relative bg-gray-900"
          style={{
            backgroundImage: "url('/images/img8.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          {/* Dark Overlay - black/50 */}
          <div className="absolute inset-0 bg-black/50" />
          
          {/* Content on top of overlay */}
          <div className="relative z-10 flex items-center justify-center h-full">
          </div>
        </div>

        {/* Right Section - Auth Form (Centered) */}
        <div className="flex items-center justify-center p-8 bg-white">
          <div className="w-full max-w-md">

            {/* Logo */}
            <div className="flex items-center gap-3 mb-10">
              <Image
                src="/images/logo.png"
                alt="Kayron Logo"
                width={50}
                height={50}
                className="h-10 w-10 object-cover"
              />
              <h4 className="text-2xl font-bold text-[#171D26] tracking-tight">
                Kayron
              </h4>
            </div>

            {/* Heading */}
            <h2 className="text-4xl font-bold mb-3 text-[#171D26] tracking-tight">
              Get Started
            </h2>
            <p className="text-sm text-gray-600 mb-8">
              Login to your account or create a new one
            </p>

            {/* Login / Signup Form */}
            <UnifiedAuthForm />
            
            {/* Optional Footer Text */}
            <div className="mt-8 text-center">
              <p className="text-xs text-gray-400">
                &copy; 2025 Kayron. All rights reserved.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}