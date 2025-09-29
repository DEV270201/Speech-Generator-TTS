"use client";

import { LucideIcon, Menu, User, Layout, History } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react'
import Image from "next/image";
import { useAppContext } from '@/state/AppContext';

interface SidebarLinkProps {
  href: string;
  icon: LucideIcon;
  label: string;
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const SidebarLink = ({
  href,
  icon: Icon,
  label,
  isCollapsed,
  toggleSidebar
} : SidebarLinkProps) => {
   const pathname = usePathname();
   const isActive = pathname === href;

   return (
    <Link href={href} onClick={toggleSidebar}>
      <div
        className={`cursor-pointer mx-2 my-2 rounded flex items-center ${
          isCollapsed ? "justify-center py-4" : "justify-start px-8 py-4"
        }
         hover:bg-blue-100 gap-3 hover:text-darkaccent transition-colors ${
          isActive ? "bg-limegreen text-darkaccent" : "bg-deepblack text-gray-200"
        }
      }`}
      >
        <span title={label}>
        <Icon className="w-6 h-6" />
        </span>

        <span
          className={`${
            isCollapsed ? "hidden" : "block"
          } font-medium`}
        >
          {label}
        </span>
      </div>
    </Link>
   )
}

function Sidebar() {
  const { isSidebarCollapsed, toggleSidebar } = useAppContext();

  const sidebarClassNames = `fixed flex flex-col ${isSidebarCollapsed ? 'w-0 md:w-16' : 'w-68 md:w-64'}
  transition-all duration-300 overflow-hidden h-full shadow-md z-40 text-gray-200 bg-darkaccent
  `
  return (
    <> 
    <div className={sidebarClassNames}>
    <div className={`flex gap-3 justify-between md:justify-normal items-center pt-8 ${isSidebarCollapsed ? 'px-5' : 'px-8'}`}>
         <Image
              src="/logo.png"
              alt="Brand Logo"
              width={30}
              height={30}
              className="rounded-full h-full object-cover"
            />
      <h3 className={` ${isSidebarCollapsed ? "hidden" : "block"} font-extrabold text-xl`}>SPEECHGEN</h3>
       <button
          className="md:hidden px-3 py-3  bg-darkaccent border border-gray-500 rounded-full hover:bg-deepblack hover:border-deepblack hover:cursor-pointer"
          onClick={toggleSidebar}
        >
          <Menu className="w-4 h-4 text-gray-200" />
        </button>
    </div>

    {/* links  */}
    <div className='flex-grow mt-8'>
        <SidebarLink
          href="/"
          icon={Layout}
          label="Home"
          isCollapsed={isSidebarCollapsed}
          toggleSidebar={toggleSidebar}
        />

          <SidebarLink
          href="/history"
          icon={History}
          label="History"
          isCollapsed={isSidebarCollapsed}
          toggleSidebar={toggleSidebar}
        />
    </div>

    {/* footer  */}
      <div className={`${isSidebarCollapsed ? "hidden" : "block"} mb-10`}>
        <p className="text-center text-xs text-gray-400">&copy; 2025 SPEECHGEN</p>
      </div>
    </div>
    </>
  )
}

export default Sidebar;