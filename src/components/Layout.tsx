import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/zustand/store";
import { socketService } from "@/lib/socket";
import { useRouter } from "next/router";
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  LogOut,
  Zap,
  Siren,
  Blocks,
  UserSearch,
  ArrowRightLeft,
  Activity,
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

// Types
type MenuGroup = {
  title: string;
  items: {
    name: string;
    icon: any;
    path: string;
  }[];
  single?: boolean;
};

// Menu Config
const menuGroups: MenuGroup[] = [
  {
    title: "Bulk Block Trades",
    items: [
      { name: "Trades", icon: Blocks, path: "/deals/bulk-block/trades" },
      {
        name: "Trade Details",
        icon: Blocks,
        path: "/deals/bulk-block/trade-details",
      },
    ],
  },
  {
    title: "Insider Activity",
    items: [
      {
        name: "Trades",
        icon: UserSearch,
        path: "/deals/insider/insider-trades",
      },
      {
        name: "Insights",
        icon: UserSearch,
        path: "/deals/insider/insider-insights",
      },
      {
        name: "Movements",
        icon: UserSearch,
        path: "/deals/insider/insider-movements",
      },
      {
        name: "Transactions",
        icon: UserSearch,
        path: "/deals/insider/insider-transactions",
      },
    ],
  },
  {
    title: "SAST Analytics",
    items: [
      { name: "Trades", icon: ArrowRightLeft, path: "/deals/sast/sast-trades" },
      {
        name: "Top Transactions",
        icon: ArrowRightLeft,
        path: "/deals/sast/sast-top-transaction",
      },
      {
        name: "Analytics",
        icon: ArrowRightLeft,
        path: "/deals/sast/sast-analysis",
      },
      {
        name: "High Probability Trades",
        icon: ArrowRightLeft,
        path: "/deals/sast/sast-high-prob-trades",
      },
      {
        name: "Recommendations",
        icon: ArrowRightLeft,
        path: "/deals/sast/sast-recommendation",
      },
    ],
  },
  // {
  //   title: "Options",
  //   items: [
  //     { name: "Option Flash", icon: Zap, path: "/options/option-deeplytics" },
  //     { name: "Signals", icon: Siren, path: "/options/option-contrarian" },
  //     {
  //       name: "Option Overview",
  //       icon: Siren,
  //       path: "/options/options-dashboard",
  //     },
  //   ],
  // },
  {
    title: "Corporate Action",
    single: true,
    items: [
      { name: "Croporate Action", icon: Zap, path: "/bhavcopy/crop-action" },
    ],
  },
  {
    title: "Technicals",
    single: true,
    items: [{ name: "Health", icon: Activity, path: "/health" }],
  },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  const toggleGroup = (title: string) => {
    const newOpenGroups = new Set(openGroups);
    newOpenGroups.has(title)
      ? newOpenGroups.delete(title)
      : newOpenGroups.add(title);
    setOpenGroups(newOpenGroups);
  };

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
          className="md:hidden fixed top-4 left-4 z-50 backdrop-blur-sm"
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
            "fixed h-full bg-background/95 border-r shadow-sm z-40 backdrop-blur-lg",
            "transition-[transform,width] duration-300 ease-in-out",
            "border-border/50",
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
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SkyZero
              </h1>
            )}
            {!isMobile && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hover:bg-accent/50"
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

          {/* Sidebar Menu */}
          <nav className="mt-4 flex flex-col h-[calc(100%-4rem)] justify-between overflow-y-auto">
            <div className="space-y-1 px-2">
              {menuGroups.map((group) => (
                <div key={group.title}>
                  {group.single ? (
                    group.items.map((item) => (
                      <Tooltip key={item.name} delayDuration={0}>
                        <TooltipTrigger asChild>
                          <Button
                            variant={
                              isActivePath(item.path) ? "secondary" : "ghost"
                            }
                            className={cn(
                              "w-full justify-start h-10 rounded-md px-3",
                              "transition-all duration-200 hover:scale-[0.98]",
                              isCollapsed && !isMobile && "justify-center"
                            )}
                            onClick={() => {
                              router.push(item.path);
                              isMobile && setIsMobileMenuOpen(false);
                            }}
                          >
                            <item.icon className="h-4 w-4 shrink-0" />
                            {(!isCollapsed || isMobile) && (
                              <span className="ml-3 truncate text-sm">
                                {item.name}
                              </span>
                            )}
                          </Button>
                        </TooltipTrigger>
                        {isCollapsed && !isMobile && (
                          <TooltipContent side="right">
                            <p>{item.name}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    ))
                  ) : (
                    <>
                      {(!isCollapsed || isMobile) && (
                        <Button
                          variant="ghost"
                          className="w-full justify-between h-10 px-3 font-medium text-sm"
                          onClick={() => toggleGroup(group.title)}
                        >
                          <span className="truncate">{group.title}</span>
                          {openGroups.has(group.title) ? (
                            <ChevronLeft className="h-4 w-4 ml-2 rotate-90" />
                          ) : (
                            <ChevronLeft className="h-4 w-4 ml-2 -rotate-90" />
                          )}
                        </Button>
                      )}
                      {(openGroups.has(group.title) || isCollapsed) &&
                        group.items.map((item) => (
                          <Tooltip key={item.name} delayDuration={0}>
                            <TooltipTrigger asChild>
                              <Button
                                variant={
                                  isActivePath(item.path)
                                    ? "secondary"
                                    : "ghost"
                                }
                                className={cn(
                                  "w-full justify-start h-10 rounded-md px-3",
                                  "transition-all duration-200 hover:scale-[0.98]",
                                  isCollapsed && !isMobile && "justify-center"
                                )}
                                onClick={() => {
                                  router.push(item.path);
                                  isMobile && setIsMobileMenuOpen(false);
                                }}
                              >
                                <item.icon className="h-4 w-4 shrink-0" />
                                {(!isCollapsed || isMobile) && (
                                  <span className="ml-3 truncate text-sm">
                                    {item.name}
                                  </span>
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
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Settings + Logout */}
            <div className="border-t px-2 py-3 space-y-1">
              <Tooltip delayDuration={0}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-10 rounded-md px-3"
                    onClick={() => router.push("/settings")}
                  >
                    <Settings className="h-4 w-4" />
                    {(!isCollapsed || isMobile) && (
                      <span className="ml-3 truncate">Settings</span>
                    )}
                  </Button>
                </TooltipTrigger>
                {isCollapsed && !isMobile && (
                  <TooltipContent side="right">
                    <p>Settings</p>
                  </TooltipContent>
                )}
              </Tooltip>

              <Button
                variant="ghost"
                className="w-full justify-start h-10 rounded-md px-3 text-red-500 hover:bg-red-500/10"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                {(!isCollapsed || isMobile) && (
                  <span className="ml-3 truncate">Logout</span>
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
          <header className="h-16 border-b flex items-center justify-end px-4 gap-4 bg-background/95 backdrop-blur-lg border-border/50 sticky top-0 z-30">
            <ThemeToggle />
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="gap-2 hover:bg-accent/50 pr-3 pl-1.5"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white">
                      {user.email[0].toUpperCase()}
                    </div>
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium truncate max-w-[160px]">
                        {user.email}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Premium
                      </span>
                    </div>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="min-w-[200px] border bg-background/95 backdrop-blur-lg"
                >
                  <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">
                    {user.email}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => router.push("/profile")}
                    className="cursor-pointer focus:bg-accent/50"
                  >
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => router.push("/settings")}
                    className="cursor-pointer focus:bg-accent/50"
                  >
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-500 focus:bg-red-500/10"
                    onSelect={handleLogout}
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </header>

          <main className="p-4 sm:p-6 lg:p-8 min-h-screen">
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

// Error Fallback Component
function ErrorFallback() {
  return (
    <div className="p-6 bg-destructive/10 rounded-lg border border-destructive/30 backdrop-blur-lg">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-destructive/20 flex items-center justify-center">
          <Siren className="h-5 w-5 text-destructive" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-destructive">
            Oops! Error Occurred
          </h2>
          <p className="mt-1 text-sm text-destructive/80">
            Please refresh the page or try again later.
          </p>
        </div>
      </div>
    </div>
  );
}

