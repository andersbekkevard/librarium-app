import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookMarked, TrendingUp, Users2, Sparkles } from "lucide-react";
import { BRAND_CLASSES } from "@/lib/colors";

interface BenefitsProps {
  icon: React.ReactElement;
  title: string;
  description: string;
}

const benefitList: BenefitsProps[] = [
  {
    icon: <BookMarked className="w-8 h-8" />,
    title: "Never Lose Track",
    description:
      "Keep all your books organized in one place. Know exactly what you've read, what you're reading, and what's on your wishlist.",
  },
  {
    icon: <TrendingUp className="w-8 h-8" />,
    title: "Track Your Progress",
    description:
      "Monitor your reading habits, set goals, and see your improvement over time with detailed analytics and insights.",
  },
  {
    icon: <Users2 className="w-8 h-8" />,
    title: "Connect with Readers",
    description:
      "Join a community of book lovers, share recommendations, and discover new books through social reading features.",
  },
  {
    icon: <Sparkles className="w-8 h-8" />,
    title: "Smart Recommendations",
    description:
      "Get personalized book suggestions based on your reading history, preferences, and what similar readers are enjoying.",
  },
];

export const BenefitsSection = () => {
  return (
    <section id="benefits" className="container py-24 sm:py-32">
      <div className="grid lg:grid-cols-2 place-items-center lg:gap-24">
        <div>
          <h2 className={`text-lg ${BRAND_CLASSES.primary.text} mb-2 tracking-wider`}>
            Benefits
          </h2>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose Librarium?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Transform your reading experience with tools designed for serious book lovers.
            From casual readers to voracious bibliophiles, Librarium adapts to your reading style.
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
                  <div className={`${BRAND_CLASSES.primary.text} mb-6`}>
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