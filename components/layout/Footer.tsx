import Link from "next/link";
import Container from "@/components/ui/Container";
import { NAV_ITEMS } from "@/lib/nav";

/** Footer del sito con brand del gruppo e navigazione secondaria. */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-line/70 text-muted border-t py-10 text-sm">
      <Container className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-foreground font-semibold">GM Group</p>
          <p>Energia solare · Mobilità elettrica · Accessori di ricarica</p>
        </div>

        <nav aria-label="Navigazione footer">
          <ul className="flex gap-4">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="hover:text-foreground transition-colors">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <p>© {year} GM Group — demo</p>
      </Container>
    </footer>
  );
}
