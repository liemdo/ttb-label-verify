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
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/applications" className="p-2 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors border border-zinc-800 bg-zinc-950">
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Application Details</h1>
            <p className="text-zinc-400 mt-1">Detailed analyst view for {result.fileName}</p>
          </div>
        </div>

        <AnalystView initialResult={result} />
      </div>
    </AuthGuard>
  );
}
