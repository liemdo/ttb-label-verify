"use client";

import { LoadingSpinner } from "@/components/shared/loading-spinner";

export function PageLoading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex h-full min-h-[50vh] w-full items-center justify-center">
      <LoadingSpinner message={message} size="lg" />
    </div>
  );
}

export default function RouteLoading() {
  return <PageLoading />;
}
