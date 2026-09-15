import { AuthGuard } from "@/components/auth/auth-guard";
import { fetchResultByIdAction } from "@/actions/results";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AnalystView } from "@/components/results/analyst-view";
import { ReviewWorkspace } from "@/components/results/review-workspace";
import { brandForHeading } from "@/lib/brand";

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
      <ReviewWorkspace
        title="Application Details"
        subtitle={`Detailed analyst view for ${brandForHeading(result)}`}
        leading={
          <Link
            href="/applications"
            className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors border border-border bg-card"
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
        }
      >
        <AnalystView initialResult={result} />
      </ReviewWorkspace>
    </AuthGuard>
  );
}
