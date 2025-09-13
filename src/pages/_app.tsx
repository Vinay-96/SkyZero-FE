import type { AppProps } from "next/app";
import { ThemeProvider } from "@/components/ThemeProvider";
import Layout from "@/components/Layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import "@/styles/globals.css";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ErrorBoundary fallback={<ErrorFallback />}>
        <Suspense fallback={<LoadingSkeleton />}>
          <Layout>
            <Component {...pageProps} />
            <Toaster />
          </Layout>
        </Suspense>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

// Error fallback component
function ErrorFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center space-y-4 max-w-md">
        <h1 className="text-2xl font-bold text-destructive">
          Application Error
        </h1>
        <p className="text-muted-foreground">
          Oops! Something went wrong. Please refresh the page or try again
          later.
        </p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Reload Page
        </Button>
      </div>
    </div>
  );
}

