import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BRAND_COLORS } from "@/lib/design/colors";
import {
  useScrollAnimation,
  useStaggeredScrollAnimation,
} from "@/lib/hooks/useScrollAnimation";
import { BookIcon, SparkleIcon, TrendUpIcon, UsersIcon } from "@phosphor-icons/react";

interface BenefitsProps {
  icon: React.ReactElement;
  title: string;
  description: string;
}

const benefitList: BenefitsProps[] = [
  {
    icon: <BookIcon className="w-8 h-8" />,
    title: "Stay Organized",
    description:
      "Keep all your books in one place with basic organization. Filter by reading state and ownership to find what you need.",
  },
  {
    icon: <TrendUpIcon className="w-8 h-8" />,
    title: "Track Your Progress",
    description:
      "Monitor your reading with simple page-by-page tracking and see basic statistics about your reading habits.",
  },
  {
    icon: <SparkleIcon className="w-8 h-8" />,
    title: "Easy Book Discovery",
    description:
      "Search millions of books through Google Books API and add them to your library with automatic metadata.",
  },
  {
    icon: <UsersIcon className="w-8 h-8" />,
    title: "More Features Coming",
    description:
      "Community features, advanced analytics, reading goals, and personalized recommendations are in development.",
  },
];

export const BenefitsSection = () => {
  const { elementRef: titleRef, isVisible: titleVisible } = useScrollAnimation({
    threshold: 0.3,
    rootMargin: "0px 0px -200px 0px",
  });
  const { elementRef: cardsRef, visibleItems } = useStaggeredScrollAnimation(
    benefitList.length,
    {
      threshold: 0.3,
      rootMargin: "0px 0px -150px 0px",
    }
  );

  return (
    <section id="benefits" className="container py-24 sm:py-32">
      <div className="grid lg:grid-cols-2 place-items-center lg:gap-24">
        <div
          ref={titleRef as React.RefObject<HTMLDivElement>}
          className={`scroll-slide-in-left ${titleVisible ? "animate" : ""}`}
        >
          <h2
            className={`text-lg ${BRAND_COLORS.primary.text} mb-2 tracking-wider`}
          >
            Benefits
          </h2>
          <h2 className="text-3xl md:text-4xl mb-4">
            Start Your Reading Journey
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Get started with essential reading tools that work today. Simple,
            effective book tracking with a roadmap for exciting features ahead.
          </p>
        </div>

        <div
          ref={cardsRef as React.RefObject<HTMLDivElement>}
          className="grid lg:grid-cols-2 gap-4 w-full"
        >
          {benefitList.map(({ icon, title, description }, index) => (
            <Card
              key={title}
              className={`bg-muted/50 dark:bg-card hover:bg-background transition-all delay-75 group/number hover-lift scroll-fade-in-up ${
                visibleItems[index] ? "animate" : ""
              }`}
              style={{
                transitionDelay: visibleItems[index]
                  ? `${index * 150}ms`
                  : "0ms",
              }}
            >
              <CardHeader>
                <div className="flex justify-between">
                  <div
                    className={`${
                      BRAND_COLORS.primary.text
                    } mb-6 scroll-bounce-in ${
                      visibleItems[index] ? "animate" : ""
                    }`}
                    style={{
                      transitionDelay: visibleItems[index]
                        ? `${index * 150 + 300}ms`
                        : "0ms",
                    }}
                  >
                    {icon}
                  </div>
                  <span className="text-5xl text-muted-foreground/15 font-medium transition-all delay-75 group-hover/number:text-muted-foreground/30">
                    0{index + 1}
                  </span>
                </div>
                <CardTitle className="text-lg">{title}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm">
                {description}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
