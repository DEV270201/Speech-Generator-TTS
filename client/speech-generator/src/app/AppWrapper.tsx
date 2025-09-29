"use client";
import React from 'react';
import Navbar from "@/app/(components)/Navbar";
import Sidebar from '@/app/(components)/Sidebar';
import { Toaster } from 'react-hot-toast';
import { AppContextProvider, useAppContext } from '@/state/AppContext';


const AppLayout = ({children}: {children: React.ReactNode}) => {
  const { isSidebarCollapsed } = useAppContext();
  return (
    <div className={`flex text-gray-900 w-full min-h-screen bg-deepblack`}>
      <Sidebar />
      <main className={`flex flex-col w-full py-7 px-9 ${isSidebarCollapsed ? 'md:pl-24' : 'md:pl-72'}`}>
         <Navbar />
         {children}
      </main>
      </div>
  )
}

const AppWrapper = ({children}: {children: React.ReactNode}) => {
  return (
   <AppContextProvider>
    <AppLayout>
    {
      children
    }
    <Toaster position="top-right" reverseOrder={false} toastOptions={{ duration: 4000 }} />
    </AppLayout>
   </AppContextProvider>
  )
}

export default AppWrapper;