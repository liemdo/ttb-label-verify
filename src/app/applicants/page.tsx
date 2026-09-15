import { AuthGuard } from "@/components/auth/auth-guard";
import { fetchApplicantDirectoryAction } from "@/actions/companies";
import { ApplicantsDirectory } from "./applicants-directory";

export const dynamic = "force-dynamic";

export default async function ApplicantsPage() {
  const applicants = await fetchApplicantDirectoryAction();

  return (
    <AuthGuard>
      <ApplicantsDirectory initialApplicants={applicants} />
    </AuthGuard>
  );
}
