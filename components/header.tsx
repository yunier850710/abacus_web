"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { signOut, useSession } from "next-auth/react";
import { motion } from "framer-motion";
import {
  Sun,
  Moon,
  User,
  LogOut,
  ChevronDown,
  Bell,
  Menu,
} from "lucide-react";
import Link from "next/link";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // After mounting, we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <button
              className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu size={24} />
            </button>
            <Link href="/dashboard">
              <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 ml-2 md:ml-0">
                Jasmin SMS Gateway Management
              </h1>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <button
              className="p-2 rounded-md text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 relative"
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <button
              className="p-2 rounded-md text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="relative">
              <button
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                  <User
                    size={18}
                    className="text-indigo-600 dark:text-indigo-400"
                  />
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                  {session?.user?.name || "User"}
                </span>
                <ChevronDown
                  size={16}
                  className="text-gray-500 dark:text-gray-400"
                />
              </button>

              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-gray-700"
                >
                  <Link href="/dashboard/settings">
                    <div className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                      Settings
                    </div>
                  </Link>
                  <button
                    className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    <div className="flex items-center">
                      <LogOut size={16} className="mr-2" />
                      Sign out
                    </div>
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700"
        >
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link href="/dashboard">
              <div className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                Dashboard
              </div>
            </Link>
            <Link href="/dashboard/users">
              <div className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                Users
              </div>
            </Link>
            <Link href="/dashboard/groups">
              <div className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                Groups
              </div>
            </Link>
            <Link href="/dashboard/connectors">
              <div className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                Connectors
              </div>
            </Link>
            <Link href="/dashboard/routes">
              <div className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                Routes
              </div>
            </Link>
            <Link href="/dashboard/filters">
              <div className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                Filters
              </div>
            </Link>
            <Link href="/dashboard/stats">
              <div className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                Statistics
              </div>
            </Link>
            <Link href="/dashboard/settings">
              <div className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">
                Settings
              </div>
            </Link>
          </div>
        </motion.div>
      )}
    </header>
  );
}