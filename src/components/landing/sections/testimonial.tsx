"use client";

import { BRAND_COLORS } from "@/lib/colors";

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
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo.",
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
        <h2
          className={`text-lg ${BRAND_COLORS.primary.text} text-center mb-2 tracking-wider`}
        >
          Testimonials
        </h2>

        <h2 className="text-3xl md:text-4xl text-center font-bold mb-4">
          Early Access Preview
        </h2>

        <h3 className="md:w-1/2 mx-auto text-xl text-center text-muted-foreground">
          Librarium is in active development. Join the early access to help
          shape the future of reading tracking.
        </h3>
      </div>

      <div className="bg-muted/50 dark:bg-card rounded-lg p-8 text-center">
        <div className="max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold mb-4">Be Part of the Journey</h3>
          <p className="text-lg text-muted-foreground mb-6">
            Librarium is a work in progress, built for readers who want simple,
            effective book tracking. Your feedback helps us build the features
            that matter most to you.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <span>• Essential reading tools ready</span>
            <span>• Regular updates</span>
            <span>• Community-driven development</span>
            <span>• Privacy-focused</span>
          </div>
        </div>
      </div>

      {/* Commented out fake testimonials - replace with real ones when available
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
                    <Star
                      className={`size-4 fill-brand-primary ${BRAND_COLORS.primary.text}`}
                    />
                    <Star
                      className={`size-4 fill-brand-primary ${BRAND_COLORS.primary.text}`}
                    />
                    <Star
                      className={`size-4 fill-brand-primary ${BRAND_COLORS.primary.text}`}
                    />
                    <Star
                      className={`size-4 fill-brand-primary ${BRAND_COLORS.primary.text}`}
                    />
                    <Star
                      className={`size-4 fill-brand-primary ${BRAND_COLORS.primary.text}`}
                    />
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
                      <AvatarFallback>
                        {review.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
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
      */}
    </section>
  );
};
