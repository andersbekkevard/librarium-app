import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BRAND_CLASSES } from "@/lib/colors";

interface FAQProps {
  question: string;
  answer: string;
  value: string;
}

const FAQList: FAQProps[] = [
  {
    question: "Is Librarium free to use?",
    answer: "Yes! Librarium offers a generous free tier that allows you to track up to 50 books with basic features. You can upgrade to Reader Pro for unlimited books and advanced analytics.",
    value: "item-1",
  },
  {
    question: "Can I import my existing book data?",
    answer:
      "Absolutely! You can import your books from Goodreads, CSV files, or manually search and add books using our Google Books integration. We make it easy to get started with your existing library.",
    value: "item-2",
  },
  {
    question: "How does reading progress tracking work?",
    answer:
      "Simply update your current page number as you read, or mark books as 'started' and 'finished'. Librarium automatically calculates your reading speed, time spent reading, and provides insights into your reading habits.",
    value: "item-3",
  },
  {
    question: "Is my reading data private and secure?",
    answer: "Your privacy is our priority. All your reading data is securely stored and encrypted. You control who can see your reading activity and can make your profile private at any time.",
    value: "item-4",
  },
  {
    question: "Can I use Librarium offline?",
    answer:
      "Librarium works best with an internet connection for syncing and book discovery. However, you can view your library and update reading progress offline - changes will sync when you're back online.",
    value: "item-5",
  },
];

export const FAQSection = () => {
  return (
    <section id="faq" className="container mx-auto md:w-[700px] py-24 sm:py-32">
      <div className="text-center mb-8">
        <h2 className={`text-lg ${BRAND_CLASSES.primary.text} text-center mb-2 tracking-wider`}>
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