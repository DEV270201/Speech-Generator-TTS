"use client";

import { Bell, Menu, Moon, Sun } from "lucide-react";
import React from "react";
import Image from "next/image";
import { useAppContext } from "@/state/AppContext";

const Navbar = () => {
  const { toggleSidebar } = useAppContext();

  return (
    <div className="flex justify-between items-center w-full mb-7 shadow-md px-5 py-3 bg-darkaccent rounded">
      {/* left side  */}
      <div className="flex justify-between items-center gap-5 flex-1">
        <div className="flex items-center gap-2 sm:gap-3 mr-2">
          <button
            className="px-3 py-3 bg-darkaccent border border-gray-500 rounded-full hover:bg-deepblack hover:border-deepblack hover:cursor-pointer"
            onClick={toggleSidebar}>
            <Menu className="w-4 h-4 text-gray-200" />
          </button>
        </div>
      </div>
      {/* right side  */}
      <div className="flex justify-between items-center gap-2 text-gray-200">
        <div className="flex items-center gap-3 cursor-pointer rounded-full">
          <Image
            src="/profile_pic.jpg"
            alt="Profile"
            width={40}
            height={40}
            className="rounded-full h-full object-cover"
          />
        </div>
        <span className="hidden sm:block">Anonymous</span>
      </div>
    </div>
  );
};

export default Navbar;
