"use client";

import Container from "@/components/ui/container";
import LoginForm from "@/components/ui/form";

export default function LoginPage() {
  return (
    <div className="h-[100dvh] flex items-center justify-center bg-[#F3F4F7]">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-2 bg-white rounded-xl overflow-hidden shadow-lg">
          {/* Left Side - Image */}
          <div className="hidden md:block md:relative bg-gray-100 flex flex-col items-center justify-center">
            <img
              src="/images/img3.png"
              alt="login_img1"
              className="w-full h-[25vh] md:h-full object-cover"
            />
          </div>

          {/* Right Side - Form */}
          <div className="flex flex-col items-center justify-center md:p-6 p-10 w-full h-full">
            <div className="w-full max-w-sm">
              {/* Logo */}
              <div className="flex items-center gap-2 mb-8">
                <img src="/images/logo.png" alt="logo" className="h-5 w-5 object-cover" />
                <h4 className="text-md font-bold text-[#171D26] tracking-tighter">Kayron</h4>
              </div>

              {/* Heading */}
              <h2 className="text-4xl font-semibold mb-4 text-[#171D26] tracking-tighter">
                Login to your account
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Enter your email and password to login
              </p>

              {/* Render the separated form */}
              <LoginForm />
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
