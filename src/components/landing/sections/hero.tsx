"use client";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import Image from "next/image";
import { BRAND_CLASSES } from "@/lib/colors";
import { signInWithGoogle } from "@/lib/auth";
import { useAuthContext } from "@/components/auth/AuthProvider";

export const HeroSection = () => {
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuthContext();
  const { theme } = useTheme();

  const handleGetStarted = async () => {
    if (isAuthenticated) {
      // User is already authenticated, redirect to dashboard
      router.push('/dashboard');
      return;
    }

    setIsSigningIn(true);
    setAuthError(null);
    
    const result = await signInWithGoogle();
    
    if (result.success) {
      // Show success message briefly before redirecting
      setShowSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
    } else {
      setAuthError(result.error?.message || 'Failed to sign in');
      setIsSigningIn(false);
    }
  };

  // Show loading state while checking auth
  if (loading) {
    return (
      <section className="container w-full">
        <div className="grid place-items-center lg:max-w-screen-xl gap-8 mx-auto py-20 md:py-32">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="container w-full">
      <div className="grid place-items-center lg:max-w-screen-xl gap-8 mx-auto py-20 md:py-32">
        <div className="text-center space-y-8">
          <Badge variant="outline" className="text-sm py-2">
            <span className="mr-2 text-brand-primary">
              <Badge className={BRAND_CLASSES.primary.bg}>New</Badge>
            </span>
            <span>Reading analytics are here!</span>
          </Badge>

          <div className="max-w-screen-md mx-auto text-center text-4xl md:text-6xl font-bold">
            <h1>
              Track Your
              <span className="text-transparent px-2 bg-gradient-to-r from-brand-accent to-brand-primary bg-clip-text">
                Reading
              </span>
              Journey
            </h1>
          </div>

          <p className="max-w-screen-sm mx-auto text-xl text-muted-foreground">
            Build your personal library, track reading progress, discover new books, 
            and connect with fellow readers. Your books, your pace, your way.
          </p>

          <div className="space-y-4 md:space-y-0 md:space-x-4">
            <Button 
              onClick={handleGetStarted}
              disabled={isSigningIn}
              aria-label={isAuthenticated ? "Go to your dashboard" : "Sign in with Google to start reading"}
              className={`w-5/6 md:w-1/4 font-bold group/arrow ${BRAND_CLASSES.primary.bg} hover:${BRAND_CLASSES.primary.bgHover}`}
            >
              {showSuccess ? (
                <>
                  ✓ Welcome! Redirecting...
                </>
              ) : isSigningIn ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : isAuthenticated ? (
                <>
                  Go to Dashboard
                  <ArrowRight className="size-5 ml-2 group-hover/arrow:translate-x-1 transition-transform" />
                </>
              ) : (
                <>
                  Start Reading
                  <ArrowRight className="size-5 ml-2 group-hover/arrow:translate-x-1 transition-transform" />
                </>
              )}
            </Button>

            <Button
              asChild
              variant="secondary"
              className="w-5/6 md:w-1/4 font-bold"
            >
              <Link href="/dashboard">
                Explore Features
              </Link>
            </Button>
          </div>

          {/* Error Message */}
          {authError && (
            <div className="mt-4 p-3 bg-status-error/10 border border-status-error/20 rounded-lg" role="alert">
              <p className="text-sm text-status-error text-center">{authError}</p>
            </div>
          )}

          {/* Success Message */}
          {showSuccess && (
            <div className="mt-4 p-3 bg-green-100 border border-green-200 rounded-lg" role="status">
              <p className="text-sm text-green-800 text-center">✓ Successfully signed in! Welcome to Librarium.</p>
            </div>
          )}
        </div>

        <div className="relative group mt-14">
          <div className="absolute top-2 lg:-top-8 left-1/2 transform -translate-x-1/2 w-[90%] mx-auto h-24 lg:h-80 bg-brand-primary/50 rounded-full blur-3xl"></div>
          <Image
            width={1200}
            height={1200}
            className="w-full md:w-[1200px] mx-auto rounded-lg relative border border-t-2 border-secondary border-t-brand-primary/30"
            src={
              theme === "light"
                ? "/images/hero-image-light.jpg"
                : "/images/hero-image-dark.jpg"
            }
            alt="dashboard"
          />

          <div className="absolute bottom-0 left-0 w-full h-32 md:h-40 bg-gradient-to-b from-background/0 via-background/90 to-background rounded-lg"></div>
        </div>
      </div>
    </section>
  );
};