import { StructuredData } from "@/components/public/StructuredData";
import { structuredData } from "@/lib/structured-data";
import { DesktopShell } from "@/components/layout/DesktopShell";
import { Home } from "@/components/home/Home";
export default function Page() {
  return (
    <DesktopShell>
      <StructuredData data={structuredData("/", "Wasilat Atilade Portfolio")} /><Home />
    </DesktopShell>
  );
}
