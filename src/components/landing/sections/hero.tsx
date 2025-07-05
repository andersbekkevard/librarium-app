"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { BRAND_CLASSES } from "@/lib/colors";

export const HeroSection = () => {
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
              asChild
              className={`w-5/6 md:w-1/4 font-bold group/arrow ${BRAND_CLASSES.primary.bg} hover:${BRAND_CLASSES.primary.bgHover}`}
            >
              <Link href="/dashboard">
                Start Reading
                <ArrowRight className="size-5 ml-2 group-hover/arrow:translate-x-1 transition-transform" />
              </Link>
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
        </div>

        <div className="relative group mt-14">
          <div className="absolute top-2 lg:-top-8 left-1/2 transform -translate-x-1/2 w-[90%] mx-auto h-24 lg:h-80 bg-brand-primary/50 rounded-full blur-3xl"></div>
          <div className="w-full md:w-[1200px] mx-auto rounded-lg relative leading-none flex items-center border border-t-2 border-secondary border-t-brand-primary/30 bg-gradient-to-br from-muted to-card p-8 md:p-16">
            <div className="text-center w-full">
              <div className="text-6xl md:text-8xl mb-4">📚</div>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">Your Personal Library</h3>
              <p className="text-muted-foreground">
                Organize, track, and discover books like never before
              </p>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 w-full h-20 md:h-28 bg-gradient-to-b from-background/0 via-background/50 to-background rounded-lg"></div>
        </div>
      </div>
    </section>
  );
};