import Container, { type ContainerProps } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

export type SectionProps = {
  id?: string;
  /** Classi sull'elemento <section> (sfondo, padding verticale extra…). */
  className?: string;
  /** Se true il contenuto è full-bleed: niente Container interno. */
  fullBleed?: boolean;
  /** Larghezza del Container interno (ignorato se fullBleed). */
  size?: ContainerProps["size"];
  containerClassName?: string;
  children: React.ReactNode;
};

/**
 * Blocco di sezione con ritmo verticale coerente (py-section). Wrappa il
 * contenuto in un Container per default; con `fullBleed` lo lascia a tutta
 * larghezza (es. hero con video) e il figlio gestisce la propria larghezza.
 */
export default function Section({
  id,
  className,
  fullBleed = false,
  size,
  containerClassName,
  children,
}: SectionProps) {
  return (
    <section id={id} className={cn("py-section", className)}>
      {fullBleed ? (
        children
      ) : (
        <Container size={size} className={containerClassName}>
          {children}
        </Container>
      )}
    </section>
  );
}
