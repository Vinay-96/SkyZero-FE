import TwoFactorAuthForm from "@/components/forms/XtreamLogin";
import { cn } from "@/lib/utils";

export default function TwoFactorAuthFormPage() {
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
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome to Xtream
          </h1>
          <p className="text-muted-foreground">
            Sign in to continue to your account
          </p>
        </div>
        <TwoFactorAuthForm />
      </div>
    </div>
  );
}

