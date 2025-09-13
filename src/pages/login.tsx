import LoginForm from "@/components/forms/LoginForm";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div
      className={cn(
        "min-h-screen flex items-center justify-center",
        "bg-background/50 backdrop-blur-sm",
        "py-8 px-4 sm:px-6 lg:px-8"
      )}
    >
      <div
        className={cn(
          "max-w-md w-full space-y-6",
          "bg-card/90 backdrop-blur-lg",
          "p-8 rounded-2xl shadow-xl",
          "border border-border/50",
          "animate-in fade-in-0 slide-in-from-bottom-4 duration-500"
        )}
      >
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
          <p className="text-muted-foreground">
            Sign in to continue to your account
          </p>
        </div>
        <LoginForm />
        <div className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}

