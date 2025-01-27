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
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { ErrorBoundary } from "./ErrorBoundary";

const menuItems = [
  { name: "Home", icon: Home, path: "/dashboard" },
  { name: "Option Flash", icon: Link, path: "/options/option-deeplytics" },
  {
    name: "Option Analytics",
    icon: ChartNoAxesCombined,
    path: "/options/options-dashboard",
  },
  {
    name: "Technicals",
    icon: ChartCandlestick,
    path: "/candles/technical-dashboard",
  },
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

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setIsMobileMenuOpen(false);
      if (mobile) setIsCollapsed(false);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <TooltipProvider>
      <div className="min-h-screen flex bg-background text-foreground">
        {/* Mobile Menu Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden fixed top-4 left-4 z-50"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <ChevronLeft className="h-6 w-6" />
          ) : (
            <ChevronRight className="h-6 w-6" />
          )}
          <span className="sr-only">Toggle navigation</span>
        </Button>

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed h-full bg-background border-r shadow-sm z-40",
            "transition-[transform,width] duration-300 ease-in-out",
            isMobile
              ? `w-64 ${
                  isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                }`
              : isCollapsed
              ? "w-16"
              : "w-64",
            !isMobile && "translate-x-0"
          )}
        >
          <div className="h-16 flex items-center justify-between px-4 border-b">
            {(!isCollapsed || isMobile) && (
              <h1 className="text-xl font-bold tracking-tight">Sky⚡Zero</h1>
            )}
            {!isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-5 w-5" />
                ) : (
                  <ChevronLeft className="h-5 w-5" />
                )}
                <span className="sr-only">Toggle sidebar</span>
              </Button>
            )}
          </div>

          <nav className="mt-4 flex flex-col h-[calc(100%-4rem)] justify-between overflow-y-auto">
            <div>
              {menuItems.map((item) => (
                <Tooltip key={item.name} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isActivePath(item.path) ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start h-12 rounded-none",
                        "transition-colors duration-200",
                        !isCollapsed && "px-4",
                        isActivePath(item.path) &&
                          "bg-accent text-accent-foreground"
                      )}
                      onClick={() => {
                        router.push(item.path);
                        isMobile && setIsMobileMenuOpen(false);
                      }}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      {(!isCollapsed || isMobile) && (
                        <span className="ml-4 truncate">{item.name}</span>
                      )}
                    </Button>
                  </TooltipTrigger>
                  {isCollapsed && !isMobile && (
                    <TooltipContent side="right">
                      <p>{item.name}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              ))}
            </div>

            <div className="border-t">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full h-12 rounded-none justify-start"
                  >
                    <Settings className="h-5 w-5 shrink-0" />
                    {(!isCollapsed || isMobile) && (
                      <span className="ml-4 truncate">Settings</span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="min-w-[200px] dark:border-gray-800"
                >
                  <DropdownMenuItem
                    onSelect={() => router.push("/profile")}
                    className="cursor-pointer"
                  >
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => router.push("/settings")}
                    className="cursor-pointer"
                  >
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button
                variant="ghost"
                className="w-full h-12 rounded-none justify-start text-red-600 hover:bg-red-100/50 dark:text-red-400 dark:hover:bg-red-900/20"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 shrink-0" />
                {(!isCollapsed || isMobile) && (
                  <span className="ml-4 truncate">Logout</span>
                )}
              </Button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <div
          className={cn(
            "flex-1 transition-margin duration-300 ease-in-out",
            isMobile ? "ml-0" : isCollapsed ? "ml-16" : "ml-64"
          )}
        >
          <header className="h-16 border-b flex items-center justify-end px-4 gap-4 bg-background">
            <ThemeToggle />
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 hover:bg-accent/50">
                    <User className="h-5 w-5" />
                    <span className="hidden sm:inline truncate max-w-[160px]">
                      {user.email}
                    </span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="min-w-[200px] dark:border-gray-800"
                >
                  <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                    {user.email}
                  </div>
                  <DropdownMenuSeparator className="dark:bg-gray-800" />
                  <DropdownMenuItem
                    onSelect={() => router.push("/profile")}
                    className="cursor-pointer"
                  >
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => router.push("/settings")}
                    className="cursor-pointer"
                  >
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="dark:bg-gray-800" />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:bg-red-100/50 dark:text-red-400 dark:focus:bg-red-900/20"
                    onSelect={handleLogout}
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
                {children}
              </ErrorBoundary>
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}

// components/ErrorFallback.tsx
function ErrorFallback() {
  return (
    <div className="p-6 bg-destructive/10 rounded-lg border border-destructive/30">
      <h2 className="text-xl font-semibold text-destructive">
        Something went wrong!
      </h2>
      <p className="mt-2 text-destructive/80">
        Please refresh the page or try again later.
      </p>
    </div>
  );
}

