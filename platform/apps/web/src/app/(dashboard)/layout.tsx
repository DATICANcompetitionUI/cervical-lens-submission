// platform/apps/web/src/app/(dashboard)/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("cervicallens_token");
    if (!token) {
      router.push("/login");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-sm font-semibold text-on-surface-variant font-sans animate-pulse">
          Verifying authorization...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col lg:flex-row">
      {/* Mobile Top Navigation Bar */}
      <div className="lg:hidden h-16 bg-parchment border-b border-sand px-6 flex items-center justify-between z-30 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center">
            <svg
              className="w-5 h-5 text-on-primary-container"
              viewBox="0 0 100 100"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M50 5C50 5 85 15.5 85 47.5C85 71.5 50 95 50 95C50 95 15 71.5 15 47.5C15 15.5 50 5 50 5ZM50 25C32.5 25 22.5 45 22.5 45C22.5 45 32.5 65 50 65C67.5 65 77.5 45 77.5 45C77.5 45 67.5 25 50 25ZM50 32.5C59.7 32.5 67.5 45 67.5 45C67.5 45 59.7 57.5 50 57.5C40.3 57.5 32.5 45 32.5 45C32.5 45 40.3 32.5 50 32.5ZM50 35C44.5 35 40 39.5 40 45C40 50.5 44.5 55 50 55C55.5 55 60 50.5 60 45C60 39.5 55.5 35 50 35ZM50 41C52.2 41 54 42.8 54 45C54 47.2 52.2 49 50 49C47.8 49 46 47.2 46 45C46 42.8 47.8 41 50 41Z"
              />
            </svg>
          </div>
          <span className="font-display font-bold text-on-surface text-sm">CervicalLens</span>
        </div>
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors"
          aria-label="Open navigation menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Responsive Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Layout Area */}
      <div className="flex-1 lg:ml-64 w-full">
        <main className="max-w-[1280px] mx-auto p-4 sm:p-8 w-full">{children}</main>
      </div>
    </div>
  );
}
