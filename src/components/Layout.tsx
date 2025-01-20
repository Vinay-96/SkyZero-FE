import { ReactNode } from "react";
import { useRouter } from "next/router";
import { useAuthStore } from "@/lib/zustand/store";
import { ThemeToggle } from "./ThemeToggle";
import { socketService } from "@/lib/socket";

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    socketService.disconnect();
    clearAuth();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <nav className="bg-white dark:bg-gray-800 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-xl font-semibold text-gray-900 dark:text-white">
                MyApp
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {user && (
                <>
                  <span className="text-gray-700 dark:text-gray-200">
                    {user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}

