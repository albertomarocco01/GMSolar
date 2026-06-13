import type { Metadata } from "next";
import PagePlaceholder from "@/components/ui/PagePlaceholder";

export const metadata: Metadata = {
  title: "Mobility",
  description: "GMobility — wallbox e colonnine di ricarica.",
};

export default function MobilityPage() {
  return (
    <PagePlaceholder eyebrow="GMobility" title="Mobilità elettrica">
      <p>
        Segnaposto della sezione Mobility (wallbox e colonnine). Qui arriverà lo storytelling 3D in
        scroll con React Three Fiber per raccontare prodotti e rete di ricarica.
      </p>
    </PagePlaceholder>
  );
}
