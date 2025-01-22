import React, { ReactNode, useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "@/lib/zustand/store";
import { ThemeToggle } from "./ThemeToggle";
import { socketService } from "@/lib/socket";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  FileText,
  Settings,
  LogOut,
  User,
  ChevronDown,
  Link,
  ChartCandlestick,
  ChartPie,
  ChartNoAxesCombined,
  NotebookPen,
  ChartScatter,
} from "lucide-react";

const menuItems = [
  { name: "Home", icon: Home, path: "/dashboard" },
  { name: "Heat Map", icon: ChartScatter, path: "/heat-map" },
  { name: "Option chain", icon: Link, path: "/dashboard" },
  { name: "Option Analytics", icon: ChartNoAxesCombined, path: "/dashboard" },
  { name: "Technicals", icon: ChartCandlestick, path: "/analytics" },
  { name: "Trades", icon: ChartPie, path: "/users" },
  { name: "Reports", icon: FileText, path: "/reports" },
  { name: "Journels", icon: NotebookPen, path: "/reports" },
];

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const handleLogout = () => {
    socketService.disconnect();
    clearAuth();
    router.push("/login");
  };

  const isActivePath = (path: string) => router.pathname === path;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Sidenav */}
      <div
        className={`fixed h-full bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ease-in-out ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700">
          {!isCollapsed && (
            <span className="text-xl font-semibold text-gray-900 dark:text-white">
              Sky⚡Zero
            </span>
          )}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="mt-4 flex flex-col h-[calc(100%-4rem)] justify-between">
          <div>
            {menuItems.map((item) => (
              <button
                key={item.name}
                onClick={() => router.push(item.path)}
                className={`w-full flex items-center px-4 py-3 transition-colors ${
                  isActivePath(item.path)
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 ${
                    isActivePath(item.path)
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                />
                {!isCollapsed && <span className="ml-4">{item.name}</span>}
              </button>
            ))}
          </div>

          {/* Bottom Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-2 pb-4">
            <button
              onClick={() => router.push("/settings")}
              className="w-full flex items-center px-4 py-3 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Settings className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              {!isCollapsed && <span className="ml-4">Settings</span>}
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              {!isCollapsed && <span className="ml-4">Logout</span>}
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        {/* Top Navigation */}
        <div className="h-16 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="h-full px-4 flex items-center justify-end space-x-4">
            <ThemeToggle />
            {user && (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <User className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-200">
                    {user.email}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>

                {/* Custom Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                    <button
                      onClick={() => {
                        router.push("/profile");
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => {
                        router.push("/settings");
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Settings
                    </button>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <main className="py-10 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}

