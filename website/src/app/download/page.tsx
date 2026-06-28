import { Suspense } from "react";
import { DownloadPage } from "@/components/DownloadPage";

export const metadata = {
  title: "Download Trivense — Split expenses, made easy.",
  description:
    "Get Trivense on Google Play. Split trip and group expenses with boards, analytics, and sharing.",
};

export default function DownloadRoute() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-100 text-slate-600">
          Loading…
        </div>
      }
    >
      <DownloadPage />
    </Suspense>
  );
}
