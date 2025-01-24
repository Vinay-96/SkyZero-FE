import RegisterForm from "@/components/forms/RegisterForm";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function RegisterPage() {
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
          "border border-border/50"
        )}
      >
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
          <p className="text-muted-foreground">
            Get started with your free account
          </p>
        </div>
        <RegisterForm />
        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
