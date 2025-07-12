import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BRAND_COLORS } from "@/lib/colors";

interface FAQProps {
  question: string;
  answer: string;
  value: string;
}

const FAQList: FAQProps[] = [
  {
    question: "Is Librarium free to use?",
    answer:
      "Yes! Librarium is currently completely free to use. All current features are available at no cost. Future premium features may be introduced as the app grows.",
    value: "item-1",
  },
  {
    question: "What can I do with Librarium right now?",
    answer:
      "You can build your personal library, track reading progress page-by-page, search and add books via Google Books API, rate finished books, and view basic reading statistics on your dashboard.",
    value: "item-2",
  },
  {
    question: "How does reading progress tracking work?",
    answer:
      "Simply update your current page number as you read. Books progress through three states: not started, in progress, and finished. Your dashboard shows real-time stats about your reading habits.",
    value: "item-3",
  },
  {
    question: "Is my reading data private and secure?",
    answer:
      "Yes, your privacy is our priority. All your reading data is securely stored in Firebase with encryption. Only you can access your personal library and reading data.",
    value: "item-4",
  },
  {
    question: "What features are coming next?",
    answer:
      "We're working on advanced analytics, reading goals, social features, custom shelves, and AI-powered recommendations. The app is actively being developed with regular updates.",
    value: "item-5",
  },
];

export const FAQSection = () => {
  return (
    <section id="faq" className="container mx-auto md:w-[700px] py-24 sm:py-32">
      <div className="text-center mb-8">
        <h2
          className={`text-lg ${BRAND_COLORS.primary.text} text-center mb-2 tracking-wider`}
        >
          FAQS
        </h2>

        <h2 className="text-3xl md:text-4xl text-center font-bold">
          Frequently Asked Questions
        </h2>
      </div>

      <Accordion type="single" collapsible className="AccordionRoot">
        {FAQList.map(({ question, answer, value }) => (
          <AccordionItem key={value} value={value}>
            <AccordionTrigger className="text-left">
              {question}
            </AccordionTrigger>

            <AccordionContent>{answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};
