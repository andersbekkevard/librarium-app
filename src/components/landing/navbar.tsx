"use client";
import { BRAND_COLORS } from "@/lib/design/colors";
import { useAuthContext } from "@/lib/providers/AuthProvider";
import { BookIcon, ListIcon, CircleNotchIcon } from "@phosphor-icons/react";
import { ArrowRightIcon, GithubLogoIcon } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { ToggleTheme } from "../toggle-theme";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";

interface RouteProps {
  href: string;
  label: string;
}

const routeList: RouteProps[] = [
  {
    href: "#features",
    label: "Features",
  },
  {
    href: "#benefits",
    label: "Benefits",
  },
  {
    href: "#services",
    label: "Services",
  },
  {
    href: "#testimonials",
    label: "Reviews",
  },
  {
    href: "#faq",
    label: "FAQ",
  },
];

export const Navbar = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const router = useRouter();
  const { isAuthenticated, signInWithGoogle } = useAuthContext();

  const handleLogin = async () => {
    if (isAuthenticated) {
      router.push("/dashboard");
      return;
    }

    setIsSigningIn(true);

    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (err) {
      console.error("Login failed:", err);
      setIsSigningIn(false);
    }
  };

  return (
    <header className="w-[90%] md:w-[80%] lg:w-[85%] lg:max-w-screen-xl top-5 mx-auto sticky border border-border/60 z-40 rounded-xl flex justify-between items-center px-4 py-3 bg-background/95 backdrop-blur-sm">
      {/* Mobile Menu */}
      <div className="flex items-center lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsOpen(!isOpen)}
              className="mr-2 text-muted-foreground hover:text-foreground"
              aria-label="Open menu"
            >
              <ListIcon className="h-5 w-5" weight="light" />
            </Button>
          </SheetTrigger>

          <SheetContent
            side="left"
            className="flex flex-col justify-between bg-background border-border/60"
          >
            <div>
              <SheetHeader className="mb-6">
                <SheetTitle className="flex items-center">
                  <Link
                    href="/"
                    className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
                  >
                    <div className="w-9 h-9 bg-brand-accent/20 rounded-xl flex items-center justify-center">
                      <BookIcon
                        className="h-5 w-5 text-brand-primary"
                        weight="duotone"
                      />
                    </div>
                    <span
                      className="text-xl text-foreground tracking-tight"
                      style={{ fontFamily: "var(--font-geist-sans)" }}
                    >
                      Librarium
                    </span>
                  </Link>
                </SheetTitle>
              </SheetHeader>

              <nav className="flex flex-col gap-1">
                {routeList.map(({ href, label }) => (
                  <Button
                    key={href}
                    onClick={() => setIsOpen(false)}
                    asChild
                    variant="ghost"
                    className="justify-start text-base font-normal text-muted-foreground hover:text-foreground"
                  >
                    <Link href={href}>{label}</Link>
                  </Button>
                ))}

                <Separator className="my-3" />

                <Button
                  onClick={handleLogin}
                  disabled={isSigningIn}
                  className={`justify-center font-medium group/arrow ${BRAND_COLORS.primary.bg} ${BRAND_COLORS.primary.bgHover} text-white`}
                >
                  {isSigningIn ? (
                    <>
                      <CircleNotchIcon
                        className="size-4 mr-2 animate-spin"
                        weight="bold"
                      />
                      Signing in...
                    </>
                  ) : isAuthenticated ? (
                    <>
                      Go to Dashboard
                      <ArrowRightIcon className="size-4 ml-2 group-hover/arrow:translate-x-1 transition-transform" />
                    </>
                  ) : (
                    <>
                      Login
                      <ArrowRightIcon className="size-4 ml-2 group-hover/arrow:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </nav>
            </div>

            <SheetFooter className="flex-col sm:flex-col justify-start items-start">
              <Separator className="mb-3" />
              <ToggleTheme />
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>

      {/* Logo - Both Mobile & Desktop */}
      <Link
        href="/"
        className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
      >
        <div className="w-9 h-9 bg-brand-accent/20 rounded-xl flex items-center justify-center shrink-0">
          <BookIcon className="h-5 w-5 text-brand-primary" weight="duotone" />
        </div>
        <span
          className="text-xl text-foreground tracking-tight hidden sm:block"
          style={{ fontFamily: "var(--font-geist-sans)" }}
        >
          Librarium
        </span>
      </Link>

      {/* Desktop Navigation */}
      <nav className="hidden lg:flex items-center gap-1">
        {routeList.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50"
          >
            {label}
          </Link>
        ))}
      </nav>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2">
        {/* Desktop Login Button */}
        <Button
          onClick={handleLogin}
          disabled={isSigningIn}
          className={`hidden lg:flex h-9 px-5 font-medium group/arrow ${BRAND_COLORS.primary.bg} ${BRAND_COLORS.primary.bgHover} text-white`}
        >
          {isSigningIn ? (
            <>
              <CircleNotchIcon
                className="size-4 mr-2 animate-spin"
                weight="bold"
              />
              Signing in...
            </>
          ) : isAuthenticated ? (
            <>
              Dashboard
              <ArrowRightIcon className="size-4 ml-2 group-hover/arrow:translate-x-1 transition-transform" />
            </>
          ) : (
            <>
              Login
              <ArrowRightIcon className="size-4 ml-2 group-hover/arrow:translate-x-1 transition-transform" />
            </>
          )}
        </Button>

        <ToggleTheme />

        <Button
          asChild
          size="icon-sm"
          variant="ghost"
          aria-label="View on GitHub"
          className="hidden lg:flex text-muted-foreground hover:text-foreground"
        >
          <Link
            aria-label="View on GitHub"
            href="https://github.com/andersbekkevard/librarium-app"
            target="_blank"
          >
            <GithubLogoIcon className="size-4" />
          </Link>
        </Button>
      </div>
    </header>
  );
};
