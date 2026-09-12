import { AuthGuard } from "@/components/auth/auth-guard";
import { fetchResultsAction } from "@/actions/results";
import { ApplicationsList } from "./applications-list";

export const dynamic = "force-dynamic";

export default async function ApplicationsPage() {
  const results = await fetchResultsAction();

  return (
    <AuthGuard>
      <div className="p-6 max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Applications Queue</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1">
            Review and manage submitted alcohol label applications
          </p>
        </div>

        <ApplicationsList initialResults={results} />
      </div>
    </AuthGuard>
  );
}
