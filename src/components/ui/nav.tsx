"use client";

import React, { useState } from "react";
import Image from "next/image";
import Container from "./container";
import { Menu, X } from "lucide-react";
import { AcademicSessionTerms } from "@/utils/nav";

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full bg-[#ffffff] sticky top-0 mb-24 z-50">
      <Container>
        <div className="flex items-center justify-between py-4">
          {/* Profile section */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 relative">
              <Image
                src="/images/profile.jpg"
                alt="profile"
                fill
                className="rounded-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-semibold text-[#171D26]">Administrator</h3>
              <p className="text-sm text-gray-500">admin@admin.com</p>
            </div>
          </div>

          {/* Always show hamburger menu */}
          <Menu
            className="w-7 h-7 cursor-pointer text-[#171D26]"
            onClick={() => setIsOpen(true)}
          />
        </div>
      </Container>

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-64 sm:w-80 bg-white shadow-lg transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Close button */}
        <div className="flex justify-end p-4">
          <X
            className="w-6 h-6 cursor-pointer text-[#171D26]"
            onClick={() => setIsOpen(false)}
          />
        </div>

        {/* Links stacked vertically */}
        <ul className="flex flex-col items-start gap-6 p-6 text-[#171D26] font-medium">
          {AcademicSessionTerms.map((item) => (
            <li
              key={item.label}
              className="hover:text-blue-[#3D4C63] cursor-pointer text-lg"
              onClick={() => setIsOpen(false)} // close drawer on link click
            >
              {item.label}
            </li>
          ))}
        </ul>
      </div>

      {/* Overlay (frosted/light effect) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-white/30 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default Nav;
