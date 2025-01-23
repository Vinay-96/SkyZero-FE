// components/Layout.tsx
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/zustand/store";
import { socketService } from "@/lib/socket";
import { useRouter } from "next/router";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  FileText,
  Settings,
  LogOut,
  User,
  Link,
  ChartCandlestick,
  ChartPie,
  ChartNoAxesCombined,
  NotebookPen,
  ChartScatter,
  ChevronDown,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "components/ui/dropdown-menu";
import { Button } from "components/ui/button";
import { Skeleton } from "components/ui/skeleton";
import { useEffect, useState, useRef, Suspense } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { ErrorBoundary } from "./ErrorBoundary";

const menuItems = [
  { name: "Home", icon: Home, path: "/dashboard" },
  { name: "Heat Map", icon: ChartScatter, path: "/heat-map" },
  { name: "Option chain", icon: Link, path: "/dashboard" },
  { name: "Option Analytics", icon: ChartNoAxesCombined, path: "/dashboard" },
  { name: "Technicals", icon: ChartCandlestick, path: "/analytics" },
  { name: "Trades", icon: ChartPie, path: "/trades" },
  { name: "Reports", icon: FileText, path: "/reports" },
  { name: "Journals", icon: NotebookPen, path: "/reports" },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    socketService.disconnect();
    clearAuth();
    router.push("/login");
  };

  const isActivePath = (path: string) => router.pathname === path;

  // Responsive sidebar handling
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) setIsMobileMenuOpen(false);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden fixed top-4 left-4 z-50"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <ChevronLeft /> : <ChevronRight />}
      </Button>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed h-full bg-background border-r transition-all duration-300 ease-in-out z-40",
          isMobile
            ? `w-64 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`
            : isCollapsed
            ? "w-16"
            : "w-64",
          !isMobile && "translate-x-0"
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b">
          {(!isCollapsed || isMobile) && (
            <h1 className="text-xl font-semibold">Sky⚡Zero</h1>
          )}
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
            </Button>
          )}
        </div>

        <nav className="mt-4 flex flex-col h-[calc(100%-4rem)] justify-between">
          <div>
            {menuItems.map((item) => (
              <TooltipProvider>
                <Tooltip key={item.name} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isActivePath(item.path) ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start h-12 rounded-none",
                        !isCollapsed && "px-4"
                      )}
                      onClick={() => {
                        router.push(item.path);
                        isMobile && setIsMobileMenuOpen(false);
                      }}
                    >
                      <item.icon className="h-5 w-5" />
                      {(!isCollapsed || isMobile) && (
                        <span className="ml-4">{item.name}</span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  {isCollapsed && !isMobile && (
                    <TooltipContent side="right">
                      <p>{item.name}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>

          <div className="border-t pt-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full h-12 rounded-none justify-start"
                >
                  <Settings className="h-5 w-5" />
                  {(!isCollapsed || isMobile) && (
                    <span className="ml-4">Settings</span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              className="w-full h-12 rounded-none justify-start text-red-600 hover:bg-red-100/50 dark:text-red-400 dark:hover:bg-red-900/20"
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              {(!isCollapsed || isMobile) && (
                <span className="ml-4">Logout</span>
              )}
            </Button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 transition-all duration-300",
          !isMobile && isCollapsed ? "ml-16" : "ml-64",
          isMobile && "ml-0"
        )}
      >
        <header className="h-16 border-b flex items-center justify-end px-4 gap-4">
          <ThemeToggle />
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <User className="h-5 w-5" />
                  <span className="hidden sm:inline">{user.email}</span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push("/settings")}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600 focus:bg-red-100/50 dark:text-red-400 dark:focus:bg-red-900/20"
                  onClick={handleLogout}
                >
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <ErrorBoundary fallback={<ErrorFallback />}>
              <Suspense fallback={<LoadingSkeleton />}>{children}</Suspense>
            </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}

// components/ErrorFallback.tsx
function ErrorFallback() {
  return (
    <div className="p-6 bg-red-100/30 rounded-lg border border-red-200 dark:bg-red-900/20 dark:border-red-800">
      <h2 className="text-xl font-semibold text-red-800 dark:text-red-200">
        Something went wrong!
      </h2>
      <p className="mt-2 text-red-700 dark:text-red-300">
        Please refresh the page or try again later.
      </p>
    </div>
  );
}

// components/LoadingSkeleton.tsx
function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-[200px]" />
      <Skeleton className="h-[400px] w-full" />
      <div className="flex gap-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}

