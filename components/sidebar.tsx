"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Server,
  Route,
  Filter,
  BarChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  UsersRound,
  MessageSquare,
} from "lucide-react";

const menuItems = [
  {
    name: "Dashboard",
    icon: <LayoutDashboard size={20} />,
    path: "/dashboard",
  },
  {
    name: "Users",
    icon: <Users size={20} />,
    path: "/dashboard/users",
  },
  {
    name: "Groups",
    icon: <UsersRound size={20} />,
    path: "/dashboard/groups",
  },
  {
    name: "Connectors",
    icon: <Server size={20} />,
    path: "/dashboard/connectors",
  },
  {
    name: "Routes",
    icon: <Route size={20} />,
    path: "/dashboard/routes",
  },
  {
    name: "Filters",
    icon: <Filter size={20} />,
    path: "/dashboard/filters",
  },
  {
    name: "Statistics",
    icon: <BarChart size={20} />,
    path: "/dashboard/stats",
  },
  {
    name: "Settings",
    icon: <Settings size={20} />,
    path: "/dashboard/settings",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      } flex flex-col`}
    >
      <div className="p-4 flex justify-between items-center">
        {!collapsed && (
          <h2 className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
            Jasmin SMS
          </h2>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          )}
        </button>
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <li key={item.path}>
                <Link href={item.path}>
                  <div
                    className={`nav-link ${
                      isActive ? "nav-link-active" : ""
                    } ${collapsed ? "justify-center" : ""}`}
                  >
                    {item.icon}
                    {!collapsed && <span>{item.name}</span>}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div
          className={`flex ${
            collapsed ? "justify-center" : "justify-start"
          } items-center`}
        >
          <MessageSquare
            size={20}
            className="text-gray-500 dark:text-gray-400"
          />
          {!collapsed && (
            <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              v1.0.0
            </span>
          )}
        </div>
      </div>
    </div>
  );
}