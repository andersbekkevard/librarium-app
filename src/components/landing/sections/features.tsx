import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BRAND_COLORS } from "@/lib/design/colors";
import { BarChart3, Book, Search, Star, Users } from "lucide-react";

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
      "Track your reading progress page by page with three simple states: not started, in progress, and finished.",
  },
  {
    icon: <Book className="w-6 h-6" />,
    title: "Personal Library",
    description:
      "Organize your book collection with basic filtering by reading state and ownership. Search and sort your books easily.",
  },
  {
    icon: <Search className="w-6 h-6" />,
    title: "Book Discovery",
    description:
      "Search millions of books through Google Books API and automatically populate details like covers, pages, and descriptions.",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Basic Statistics",
    description:
      "View essential reading stats on your dashboard: total books, finished books, pages read, and current reading count.",
  },
  {
    icon: <Star className="w-6 h-6" />,
    title: "Book Ratings",
    description:
      "Rate finished books with a 1-5 star system to remember your favorites and track your reading preferences.",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Coming Soon",
    description:
      "Social reading features, advanced analytics, reading goals, and custom shelves are planned for future releases.",
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="container py-24 sm:py-32">
      <h2
        className={`text-lg ${BRAND_COLORS.primary.text} text-center mb-2 tracking-wider`}
      >
        Features
      </h2>

      <h2 className="text-3xl md:text-4xl text-center font-bold mb-4">
        Essential Reading Tools
      </h2>
      <h3 className="md:w-1/2 mx-auto text-xl text-center text-muted-foreground mb-8">
        Core features are ready now, with advanced capabilities planned for
        future releases. Start tracking your reading journey today.
      </h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {featureList.map(({ icon, title, description }) => (
          <div key={title}>
            <Card className="h-full bg-background border-0 shadow-none">
              <CardHeader className="flex flex-col justify-center items-center">
                <div
                  className={`${BRAND_COLORS.primary.bg}/20 p-2 rounded-full ring-8 ring-brand-primary/10 mb-4`}
                >
                  <div className={BRAND_COLORS.primary.text}>{icon}</div>
                </div>

                <CardTitle className="text-center">{title}</CardTitle>
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
