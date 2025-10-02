"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Container from "./container";
import { Menu, X } from "lucide-react";
import { AcademicSessionTerms, NavItem } from "@/utils/nav";

const Nav = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full sticky top-0 z-50 bg-[#F3F4F7]">
      <Container>
        <div className="flex items-center justify-between py-4 px-4 bg-white rounded-md">
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

          {/* Hamburger menu */}
          <Menu
            className="w-5 h-5 cursor-pointer text-[#171D26]"
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
            className="w-4 h-4 cursor-pointer text-[#171D26]"
            onClick={() => setIsOpen(false)}
          />
        </div>

        {/* Links stacked vertically */}
        <ul className="flex flex-col items-start gap-6 p-6 text-[#171D26] font-medium">
          {AcademicSessionTerms.map((item: NavItem) => (
            <li key={item.label} className="text-sm">
              <Link
                href={item.link} // <-- use 'link' here
                className="hover:text-[#3D4C63]"
                onClick={() => setIsOpen(false)} // close drawer on click
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default Nav;
