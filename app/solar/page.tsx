import type { Metadata } from "next";
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export const metadata: Metadata = {
  title: "Solar",
  description: "GM Solar — EPC fotovoltaico.",
};

export default function SolarPage() {
  return (
    <PagePlaceholder eyebrow="GM Solar" title="Energia solare" accentClassName="text-solar">
      <p>
        Segnaposto della sezione Solar (EPC fotovoltaico). Qui arriveranno il video cinematic, lo
        scroll storytelling, le statistiche, la mappa progetti e il calcolatore ROI.
      </p>
    </PagePlaceholder>
  );
}
