import { BRAND_CLASSES } from "@/lib/colors";

export const SponsorsSection = () => {
  return (
    <section id="sponsors" className="container pt-8 sm:py-32">
      <h2
        className={`text-lg ${BRAND_CLASSES.primary.text} text-center mb-2 tracking-wider`}
      >
        Integrations
      </h2>

      <h2 className="text-3xl md:text-4xl text-center font-bold mb-4">
        Works With Your Favorite Platforms
      </h2>

      <h3 className="md:w-1/2 mx-auto text-xl text-center text-muted-foreground mb-8">
        Seamlessly connect with popular book platforms and services
      </h3>

      <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
        <div className="flex items-center gap-1 text-muted-foreground">
          <span className="font-bold text-lg">📚</span>
          <span className="text-xl font-semibold">Google Books</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <span className="font-bold text-lg">📖</span>
          <span className="text-xl font-semibold">Goodreads</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <span className="font-bold text-lg">📚</span>
          <span className="text-xl font-semibold">Open Library</span>
        </div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <span className="font-bold text-lg">📱</span>
          <span className="text-xl font-semibold">Kindle</span>
        </div>
      </div>
    </section>
  );
};
