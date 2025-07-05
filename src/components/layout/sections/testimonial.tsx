"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Star } from "lucide-react";
import { BRAND_CLASSES } from "@/lib/colors";

interface ReviewProps {
  image: string;
  name: string;
  userName: string;
  comment: string;
  rating: number;
}

const reviewList: ReviewProps[] = [
  {
    image: "https://github.com/shadcn.png",
    name: "Sarah Chen",
    userName: "Book Blogger",
    comment:
      "Librarium has completely transformed how I track my reading. The analytics are incredible and the interface is so intuitive. I've discovered more books this year than ever before!",
    rating: 5.0,
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Michael Rodriguez",
    userName: "Literature Professor",
    comment:
      "As someone who reads dozens of books per semester, Librarium helps me stay organized and track my reading progress. The collaboration features are perfect for my book clubs.",
    rating: 5.0,
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Emma Thompson",
    userName: "Avid Reader",
    comment:
      "I love how Librarium makes reading social! Sharing my progress with friends and getting recommendations has made reading so much more engaging.",
    rating: 5.0,
  },
  {
    image: "https://github.com/shadcn.png",
    name: "David Kim",
    userName: "Author",
    comment:
      "The reading analytics feature is amazing! I can see exactly how my reading habits have evolved over time. It's like having a personal reading coach.",
    rating: 5.0,
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Lisa Johnson",
    userName: "Librarian",
    comment:
      "Librarium bridges the gap between traditional reading and modern technology. My patrons love the goal-setting features and progress tracking.",
    rating: 5.0,
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Alex Martinez",
    userName: "Book Reviewer",
    comment:
      "The best reading tracker I've ever used! The Google Books integration saves so much time, and the interface is clean and distraction-free.",
    rating: 5.0,
  },
];

export const TestimonialSection = () => {
  return (
    <section id="testimonials" className="container py-24 sm:py-32">
      <div className="text-center mb-8">
        <h2 className={`text-lg ${BRAND_CLASSES.primary.text} text-center mb-2 tracking-wider`}>
          Testimonials
        </h2>

        <h2 className="text-3xl md:text-4xl text-center font-bold mb-4">
          What Readers Are Saying
        </h2>

        <h3 className="md:w-1/2 mx-auto text-xl text-center text-muted-foreground">
          Join thousands of readers who have transformed their reading experience with Librarium.
        </h3>
      </div>

      <Carousel
        opts={{
          align: "start",
        }}
        className="relative w-[80%] sm:w-[90%] lg:max-w-screen-xl mx-auto"
      >
        <CarouselContent>
          {reviewList.map((review) => (
            <CarouselItem
              key={review.name}
              className="md:basis-1/2 lg:basis-1/3"
            >
              <Card className="bg-muted/50 dark:bg-card">
                <CardContent className="pt-6 pb-0">
                  <div className="flex gap-1 pb-6">
                    <Star className={`size-4 fill-brand-primary ${BRAND_CLASSES.primary.text}`} />
                    <Star className={`size-4 fill-brand-primary ${BRAND_CLASSES.primary.text}`} />
                    <Star className={`size-4 fill-brand-primary ${BRAND_CLASSES.primary.text}`} />
                    <Star className={`size-4 fill-brand-primary ${BRAND_CLASSES.primary.text}`} />
                    <Star className={`size-4 fill-brand-primary ${BRAND_CLASSES.primary.text}`} />
                  </div>
                  {`"${review.comment}"`}
                </CardContent>

                <CardHeader>
                  <div className="flex flex-row items-center gap-4">
                    <Avatar>
                      <AvatarImage
                        src="https://avatars.githubusercontent.com/u/75042455?v=4"
                        alt="radix"
                      />
                      <AvatarFallback>{review.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                    </Avatar>

                    <div className="flex flex-col">
                      <CardTitle className="text-lg">{review.name}</CardTitle>
                      <CardDescription>{review.userName}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </section>
  );
};