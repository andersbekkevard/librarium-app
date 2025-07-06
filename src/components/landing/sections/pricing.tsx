import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";
import { BRAND_CLASSES } from "@/lib/colors";

enum PopularPlan {
  NO = 0,
  YES = 1,
}

interface PlanProps {
  title: string;
  popular: PopularPlan;
  price: number;
  description: string;
  buttonText: string;
  benefitList: string[];
}

const plans: PlanProps[] = [
  {
    title: "Free",
    popular: 0,
    price: 0,
    description:
      "Perfect for casual readers who want to get started with digital book tracking.",
    buttonText: "Start Free",
    benefitList: [
      "Up to 50 books",
      "Basic reading progress",
      "3 custom shelves",
      "Reading goals",
      "Community access",
    ],
  },
  {
    title: "Reader Pro",
    popular: 1,
    price: 5,
    description:
      "For serious readers who want advanced features and unlimited book tracking.",
    buttonText: "Get Reader Pro",
    benefitList: [
      "Unlimited books",
      "Advanced analytics",
      "Unlimited shelves",
      "Book recommendations",
      "Reading insights",
      "Export data",
      "Priority support",
    ],
  },
  {
    title: "Book Club",
    popular: 0,
    price: 15,
    description:
      "Perfect for book clubs, libraries, and reading groups with collaboration features.",
    buttonText: "Start Book Club",
    benefitList: [
      "Everything in Reader Pro",
      "Up to 25 members",
      "Group reading challenges",
      "Discussion forums",
      "Reading schedules",
      "Group analytics",
      "Admin controls",
    ],
  },
];

export const PricingSection = () => {
  return (
    <section id="pricing" className="container py-24 sm:py-32">
      <h2
        className={`text-lg ${BRAND_CLASSES.primary.text} text-center mb-2 tracking-wider`}
      >
        Pricing
      </h2>

      <h2 className="text-3xl md:text-4xl text-center font-bold mb-4">
        Choose Your Reading Plan
      </h2>

      <h3 className="md:w-1/2 mx-auto text-xl text-center text-muted-foreground pb-14">
        Start free and upgrade when you&apos;re ready for more advanced reading
        features.
      </h3>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-4">
        {plans.map(
          ({ title, popular, price, description, buttonText, benefitList }) => (
            <Card
              key={title}
              className={
                popular === PopularPlan?.YES
                  ? "drop-shadow-xl shadow-black/10 dark:shadow-white/10 border-[1.5px] border-brand-primary lg:scale-[1.1]"
                  : ""
              }
            >
              <CardHeader>
                <CardTitle className="pb-2">{title}</CardTitle>

                <CardDescription className="pb-4">
                  {description}
                </CardDescription>

                <div>
                  <span className="text-3xl font-bold">${price}</span>
                  <span className="text-muted-foreground"> /month</span>
                </div>
              </CardHeader>

              <CardContent className="flex">
                <div className="space-y-4">
                  {benefitList.map((benefit) => (
                    <span key={benefit} className="flex">
                      <Check className={`${BRAND_CLASSES.primary.text} mr-2`} />
                      <h3 className="text-sm">{benefit}</h3>
                    </span>
                  ))}
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  asChild
                  variant={
                    popular === PopularPlan?.YES ? "default" : "secondary"
                  }
                  className={`w-full ${
                    popular === PopularPlan?.YES
                      ? `${BRAND_CLASSES.primary.bg} hover:${BRAND_CLASSES.primary.bgHover}`
                      : ""
                  }`}
                >
                  <Link href="/dashboard">{buttonText}</Link>
                </Button>
              </CardFooter>
            </Card>
          )
        )}
      </div>
    </section>
  );
};
