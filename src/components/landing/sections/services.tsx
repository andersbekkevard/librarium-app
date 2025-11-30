import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BRAND_COLORS } from "@/lib/design/colors";
import {
  useScrollAnimation,
  useStaggeredScrollAnimation,
} from "@/lib/hooks/useScrollAnimation";

enum ProService {
  YES = 1,
  NO = 0,
}

interface ServiceProps {
  title: string;
  pro: ProService;
  description: string;
}

const serviceList: ServiceProps[] = [
  {
    title: "Google Books Integration",
    pro: 0,
    description:
      "Search millions of books and automatically fetch metadata, covers, and descriptions. Add books to your library with one click.",
  },
  {
    title: "Firebase Authentication",
    pro: 0,
    description:
      "Secure Google sign-in with cloud synchronization across all your devices. Your library stays up-to-date everywhere.",
  },
  {
    title: "Advanced Reading Analytics",
    pro: 1,
    description:
      "Detailed insights into your reading patterns, speed, and preferences with comprehensive data visualization. Coming soon!",
  },
  {
    title: "Social Reading Features",
    pro: 1,
    description:
      "Share books with friends, join reading groups, and discover what fellow readers are enjoying. In development!",
  },
];

export const ServicesSection = () => {
  const { elementRef: headerRef, isVisible: headerVisible } =
    useScrollAnimation();
  const { elementRef: cardsRef, visibleItems } = useStaggeredScrollAnimation(
    serviceList.length
  );

  return (
    <section id="services" className="container py-24 sm:py-32">
      <div
        ref={headerRef as React.RefObject<HTMLDivElement>}
        className={`text-center mb-16 scroll-fade-in-up ${
          headerVisible ? "animate" : ""
        }`}
      >
        <h2
          className={`text-lg ${BRAND_COLORS.primary.text} text-center mb-2 tracking-wider`}
        >
          Integrations
        </h2>
        <h2 className="text-3xl md:text-4xl text-center mb-4">
          Current & Planned Integrations
        </h2>
        <h3 className="md:w-1/2 mx-auto text-xl text-center text-muted-foreground">
          Essential integrations are live now, with advanced features and social
          capabilities coming in future releases.
        </h3>
      </div>

      <div
        ref={cardsRef as React.RefObject<HTMLDivElement>}
        className="grid lg:grid-cols-2 gap-4 w-full lg:gap-x-4"
      >
        {serviceList.map(({ title, description, pro }, index) => (
          <Card
            key={title}
            className={`bg-muted/60 dark:bg-card h-full relative hover-lift scroll-fade-in-up ${
              visibleItems[index] ? "animate" : ""
            }`}
            style={{
              transitionDelay: visibleItems[index] ? `${index * 200}ms` : "0ms",
            }}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <CardTitle className="mb-2">{title}</CardTitle>
                {pro === ProService.YES && (
                  <Badge
                    variant="secondary"
                    className={`${
                      BRAND_COLORS.primary.bg
                    } text-primary-foreground scroll-bounce-in ${
                      visibleItems[index] ? "animate" : ""
                    }`}
                    style={{
                      transitionDelay: visibleItems[index]
                        ? `${index * 200 + 400}ms`
                        : "0ms",
                    }}
                  >
                    PRO
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              {description}
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
};
