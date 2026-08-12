import { LoadingSpinner } from "@/components/shared/loading-spinner";

export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas">
      <LoadingSpinner label="กำลังโหลด..." />
    </div>
  );
}
