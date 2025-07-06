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
    name: "John D.",
    userName: "Reader",
    comment:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsom dolor sit ammet",
    rating: 5.0,
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Jane S.",
    userName: "Book Enthusiast",
    comment:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident.",
    rating: 5.0,
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Mike R.",
    userName: "Avid Reader",
    comment:
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore.",
    rating: 5.0,
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Sarah L.",
    userName: "Literature Fan",
    comment:
      "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias.",
    rating: 5.0,
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Tom W.",
    userName: "Book Lover",
    comment:
      "Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est.",
    rating: 5.0,
  },
  {
    image: "https://github.com/shadcn.png",
    name: "Emma K.",
    userName: "Reading Enthusiast",
    comment:
      "Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae.",
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