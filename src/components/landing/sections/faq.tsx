import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BRAND_COLORS } from "@/lib/design/colors";
import {
  useScrollAnimation,
  useStaggeredScrollAnimation,
} from "@/lib/hooks/useScrollAnimation";

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
  const { elementRef: headerRef, isVisible: headerVisible } =
    useScrollAnimation();
  const { elementRef: accordionRef, visibleItems } =
    useStaggeredScrollAnimation(FAQList.length);

  return (
    <section id="faq" className="container mx-auto md:w-[700px] py-24 sm:py-32">
      <div
        ref={headerRef as React.RefObject<HTMLDivElement>}
        className={`text-center mb-8 scroll-fade-in-up ${
          headerVisible ? "animate" : ""
        }`}
      >
        <h2
          className={`text-lg ${BRAND_COLORS.primary.text} text-center mb-2 tracking-wider`}
        >
          FAQS
        </h2>

        <h2 className="text-3xl md:text-4xl text-center">
          Frequently Asked Questions
        </h2>
      </div>

      <Accordion
        ref={accordionRef as React.RefObject<HTMLDivElement>}
        type="single"
        collapsible
        className="AccordionRoot"
      >
        {FAQList.map(({ question, answer, value }, index) => (
          <AccordionItem
            key={value}
            value={value}
            className={`hover-scale scroll-fade-in-up ${
              visibleItems[index] ? "animate" : ""
            }`}
            style={{
              transitionDelay: visibleItems[index] ? `${index * 150}ms` : "0ms",
            }}
          >
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
