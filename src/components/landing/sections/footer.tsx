import { BRAND_COLORS } from "@/lib/design/colors";
import { BookOpen } from "lucide-react";
import Link from "next/link";

export const FooterSection = () => {
  return (
    <footer id="footer" className="container pt-24 sm:pt-32">
      <div className="p-10 bg-card border border-secondary rounded-2xl">
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-x-12 gap-y-8">
          <div className="col-span-full xl:col-span-2">
            <Link href="#" className="flex font-bold items-center">
              <BookOpen
                className={`${BRAND_COLORS.primary.bg} w-9 h-9 mr-2 rounded-lg border border-secondary text-white p-2`}
              />
              <h3 className="text-2xl">Librarium</h3>
            </Link>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lg">Features</h3>
            <div>
              <Link href="#" className="opacity-60 hover:opacity-100">
                Track Reading
              </Link>
            </div>

            <div>
              <Link href="#" className="opacity-60 hover:opacity-100">
                Book Discovery
              </Link>
            </div>

            <div>
              <Link href="#" className="opacity-60 hover:opacity-100">
                Reading Analytics
              </Link>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lg">Community</h3>
            <div>
              <Link href="#" className="opacity-60 hover:opacity-100">
                Book Clubs
              </Link>
            </div>

            <div>
              <Link href="#" className="opacity-60 hover:opacity-100">
                Reading Groups
              </Link>
            </div>

            <div>
              <Link href="#" className="opacity-60 hover:opacity-100">
                Recommendations
              </Link>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lg">Support</h3>
            <div>
              <Link href="#" className="opacity-60 hover:opacity-100">
                Help Center
              </Link>
            </div>

            <div>
              <Link href="#" className="opacity-60 hover:opacity-100">
                Contact Us
              </Link>
            </div>

            <div>
              <Link href="#" className="opacity-60 hover:opacity-100">
                Privacy Policy
              </Link>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-lg">Company</h3>
            <div>
              <Link href="#" className="opacity-60 hover:opacity-100">
                About
              </Link>
            </div>

            <div>
              <Link href="#" className="opacity-60 hover:opacity-100">
                Blog
              </Link>
            </div>

            <div>
              <Link href="#" className="opacity-60 hover:opacity-100">
                Careers
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-secondary pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-muted-foreground">
              © 2025 Librarium. All rights reserved.
            </div>
            <div className="text-sm text-muted-foreground">
              Made with ❤️ for book lovers everywhere
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
