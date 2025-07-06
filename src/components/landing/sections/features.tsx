import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, Users, BarChart3, Search, Target } from "lucide-react";
import { BRAND_CLASSES } from "@/lib/colors";

interface FeaturesProps {
  icon: React.ReactElement;
  title: string;
  description: string;
}

const featureList: FeaturesProps[] = [
  {
    icon: <Book className="w-6 h-6" />,
    title: "Reading Progress",
    description:
      "Track your reading progress page by page, set reading goals, and maintain detailed reading history for every book.",
  },
  {
    icon: <Book className="w-6 h-6" />,
    title: "Personal Library",
    description:
      "Organize your book collection with custom shelves, tags, and categories. Never lose track of what you own or want to read.",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Social Reading",
    description:
      "Share books with friends, join reading groups, and discover what fellow readers are enjoying.",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Reading Analytics",
    description:
      "Visualize your reading habits with detailed statistics, trends, and insights about your literary journey.",
  },
  {
    icon: <Search className="w-6 h-6" />,
    title: "Book Discovery",
    description:
      "Find your next great read with intelligent recommendations based on your reading history and preferences.",
  },
  {
    icon: <Target className="w-6 h-6" />,
    title: "Reading Goals",
    description:
      "Set and track annual reading goals, challenge yourself with new genres, and celebrate your achievements.",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="container py-24 sm:py-32">
      <h2 className={`text-lg ${BRAND_CLASSES.primary.text} text-center mb-2 tracking-wider`}>
        Features
      </h2>

      <h2 className="text-3xl md:text-4xl text-center font-bold mb-4">
        Everything You Need for Reading
      </h2>

      <h3 className="md:w-1/2 mx-auto text-xl text-center text-muted-foreground mb-8">
        From tracking your progress to discovering your next favorite book, 
        Librarium provides all the tools you need for an enriched reading experience.
      </h3>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {featureList.map(({ icon, title, description }) => (
          <div key={title}>
            <Card className="h-full bg-background border-0 shadow-none">
              <CardHeader className="flex justify-center items-center">
                <div className={`${BRAND_CLASSES.primary.bg}/20 p-2 rounded-full ring-8 ring-brand-primary/10 mb-4`}>
                  <div className={BRAND_CLASSES.primary.text}>
                    {icon}
                  </div>
                </div>

                <CardTitle>{title}</CardTitle>
              </CardHeader>

              <CardContent className="text-muted-foreground text-center">
                {description}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </section>
  );
};