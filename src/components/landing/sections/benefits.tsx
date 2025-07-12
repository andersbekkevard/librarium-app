import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BRAND_COLORS } from "@/lib/colors";
import { Book, Sparkles, TrendingUp, Users2 } from "lucide-react";

interface BenefitsProps {
  icon: React.ReactElement;
  title: string;
  description: string;
}

const benefitList: BenefitsProps[] = [
  {
    icon: <Book className="w-8 h-8" />,
    title: "Stay Organized",
    description:
      "Keep all your books in one place with basic organization. Filter by reading state and ownership to find what you need.",
  },
  {
    icon: <TrendingUp className="w-8 h-8" />,
    title: "Track Your Progress",
    description:
      "Monitor your reading with simple page-by-page tracking and see basic statistics about your reading habits.",
  },
  {
    icon: <Sparkles className="w-8 h-8" />,
    title: "Easy Book Discovery",
    description:
      "Search millions of books through Google Books API and add them to your library with automatic metadata.",
  },
  {
    icon: <Users2 className="w-8 h-8" />,
    title: "More Features Coming",
    description:
      "Community features, advanced analytics, reading goals, and personalized recommendations are in development.",
  },
];

export const BenefitsSection = () => {
  return (
    <section id="benefits" className="container py-24 sm:py-32">
      <div className="grid lg:grid-cols-2 place-items-center lg:gap-24">
        <div>
          <h2
            className={`text-lg ${BRAND_COLORS.primary.text} mb-2 tracking-wider`}
          >
            Benefits
          </h2>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Start Your Reading Journey
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Get started with essential reading tools that work today. Simple,
            effective book tracking with a roadmap for exciting features ahead.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-4 w-full">
          {benefitList.map(({ icon, title, description }, index) => (
            <Card
              key={title}
              className={`bg-muted/50 dark:bg-card hover:bg-background transition-all delay-75 group/number`}
            >
              <CardHeader>
                <div className="flex justify-between">
                  <div className={`${BRAND_COLORS.primary.text} mb-6`}>
                    {icon}
                  </div>
                  <span className="text-5xl text-muted-foreground/15 font-medium transition-all delay-75 group-hover/number:text-muted-foreground/30">
                    0{index + 1}
                  </span>
                </div>
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                {description}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
