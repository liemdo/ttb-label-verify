import { AuthGuard } from "@/components/auth/auth-guard";
import { fetchResultsAction } from "@/actions/results";
import { ApplicationsList } from "./applications-list";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ company?: string }>;
}) {
  const results = await fetchResultsAction();
  const { company } = await searchParams;

  return (
    <AuthGuard>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Applications Queue</h1>
          <p className="text-muted-foreground mt-1">
            Review and manage submitted alcohol label applications
          </p>
        </div>

        <ApplicationsList
          initialResults={results}
          initialCompany={company?.trim() || undefined}
        />
      </div>
    </AuthGuard>
  );
}
