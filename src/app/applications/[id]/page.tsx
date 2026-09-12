import { AuthGuard } from "@/components/auth/auth-guard";
import { fetchResultByIdAction } from "@/actions/results";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AnalystView } from "./analyst-view";

export const dynamic = "force-dynamic";

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await fetchResultByIdAction(id);

  if (!result) {
    notFound();
  }

  return (
    <AuthGuard>
      <div className="p-6 max-w-[90rem] mx-auto flex flex-col gap-6 lg:h-full lg:min-h-0 lg:overflow-hidden">
        <div className="flex items-center gap-4 shrink-0">
          <Link href="/applications" className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors border border-border bg-card">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Application Details</h1>
            <p className="text-muted-foreground mt-1">Detailed analyst view for {result.fileName}</p>
          </div>
        </div>

        <AnalystView initialResult={result} />
      </div>
    </AuthGuard>
  );
}
