"use client";
import { BRAND_COLORS } from "@/lib/design/colors";
import { useAuthContext } from "@/lib/providers/AuthProvider";
import { ArrowRight, Book, Github, Loader2, Menu } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { ToggleTheme } from "../toggle-theme";
import { Button } from "../ui/button";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "../ui/navigation-menu";
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

interface FeatureProps {
  title: string;
  description: string;
}

const routeList: RouteProps[] = [
  {
    href: "#benefits",
    label: "Benefits",
  },
  {
    href: "#features",
    label: "Features",
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

const featureList: FeatureProps[] = [
  {
    title: "Track Your Reading",
    description:
      "Monitor your reading progress and maintain your personal library.",
  },
  {
    title: "Discover Books",
    description:
      "Find new books with intelligent recommendations and social features.",
  },
  {
    title: "Reading Analytics",
    description: "Visualize your reading habits and track your reading goals.",
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
    <header className="shadow-inner bg-opacity-15 w-[90%] md:w-[70%] lg:w-[75%] lg:max-w-screen-xl top-5 mx-auto sticky border border-secondary z-40 rounded-2xl flex justify-between items-center p-2 bg-card">
      {/* <!-- Mobile --> */}
      <div className="flex items-center lg:hidden">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Menu
              onClick={() => setIsOpen(!isOpen)}
              className="cursor-pointer lg:hidden mr-3"
            />
          </SheetTrigger>

          <SheetContent
            side="left"
            className="flex flex-col justify-between rounded-tr-2xl rounded-br-2xl bg-card border-secondary"
          >
            <div>
              <SheetHeader className="mb-4 ml-4">
                <SheetTitle className="flex items-center">
                  <Link
                    href="/"
                    className="flex items-center whitespace-nowrap"
                  >
                    <div
                      className={`${BRAND_COLORS.primary.bg} rounded-lg w-9 h-9 mr-2 flex items-center justify-center`}
                    >
                      <Book className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-foreground">Librarium</span>
                  </Link>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col gap-2">
                {routeList.map(({ href, label }) => (
                  <Button
                    key={href}
                    onClick={() => setIsOpen(false)}
                    asChild
                    variant="ghost"
                    className="justify-start text-base"
                  >
                    <Link href={href}>{label}</Link>
                  </Button>
                ))}

                {/* Mobile Login Button */}
                <Button
                  onClick={handleLogin}
                  disabled={isSigningIn}
                  className={`mt-2 justify-start text-base font-semibold group/arrow ${BRAND_COLORS.primary.bg} ${BRAND_COLORS.primary.bgHover} text-white shadow-none border-none`}
                >
                  {isSigningIn ? (
                    <>
                      <Loader2 className="size-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : isAuthenticated ? (
                    <>
                      Go to Dashboard
                      <ArrowRight className="size-4 ml-2 group-hover/arrow:translate-x-1 transition-transform" />
                    </>
                  ) : (
                    <>
                      Login
                      <ArrowRight className="size-4 ml-2 group-hover/arrow:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            <SheetFooter className="flex-col sm:flex-col justify-start items-start">
              <Separator className="mb-2" />
              <ToggleTheme />
            </SheetFooter>
          </SheetContent>
        </Sheet>

        <Link
          href="/"
          className="font-bold text-lg flex items-center whitespace-nowrap"
        >
          <div
            className={`${BRAND_COLORS.primary.bg} rounded-lg w-7 h-7 mr-2 flex items-center justify-center`}
          >
            <Book className="h-4 w-4 text-white" />
          </div>
          <span className="text-foreground">Librarium</span>
        </Link>
      </div>

      {/* <!-- Desktop Logo --> */}
      <Link
        href="/"
        className="font-bold text-lg items-center whitespace-nowrap hidden lg:flex"
      >
        <div
          className={`${BRAND_COLORS.primary.bg} rounded-lg w-7 h-7 mr-2 flex items-center justify-center`}
        >
          <Book className="h-4 w-4 text-white" />
        </div>
        <span className="text-foreground">Librarium</span>
      </Link>

      {/* <!-- Mobile spacer --> */}
      <div className="lg:hidden"></div>

      {/* <!-- Desktop --> */}
      <NavigationMenu className="hidden lg:block mx-auto">
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger className="bg-card text-base">
              Features
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <div className="grid w-[600px] grid-cols-2 gap-5 p-4">
                <div className="flex items-center justify-center bg-gradient-to-br from-brand-primary to-brand-accent rounded-lg h-full min-h-[200px]">
                  <Book className="w-20 h-20 text-white" />
                </div>
                <ul className="flex flex-col gap-2">
                  {featureList.map(({ title, description }) => (
                    <li
                      key={title}
                      className="rounded-md p-3 text-sm hover:bg-muted"
                    >
                      <p className="mb-1 font-semibold leading-none text-foreground">
                        {title}
                      </p>
                      <p className="line-clamp-2 text-muted-foreground">
                        {description}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            {routeList.map(({ href, label }) => (
              <NavigationMenuLink key={href} asChild>
                <Link href={href} className="text-base px-2">
                  {label}
                </Link>
              </NavigationMenuLink>
            ))}

            {/* Desktop Login Button */}
            <Button
              onClick={handleLogin}
              disabled={isSigningIn}
              className={`ml-14 h-8 !px-10 font-semibold group/arrow ${BRAND_COLORS.primary.bg} ${BRAND_COLORS.primary.bgHover} text-white`}
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : isAuthenticated ? (
                <>
                  Dashboard
                  <ArrowRight className="size-4 ml-2 group-hover/arrow:translate-x-1 transition-transform" />
                </>
              ) : (
                <>
                  Login
                  <ArrowRight className="size-4 ml-2 group-hover/arrow:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <div className="flex">
        <ToggleTheme />

        <Button
          asChild
          size="sm"
          variant="ghost"
          aria-label="View on GitHub"
          className="hidden lg:flex"
        >
          <Link
            aria-label="View on GitHub"
            href="https://github.com/andersbekkevard/librarium-app"
            target="_blank"
          >
            <Github className="size-5" />
          </Link>
        </Button>
      </div>
    </header>
  );
};
