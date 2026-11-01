import { LoaderCircle } from "lucide-react";

export default function LoadingSpinner() {
  return (
    <div className="flex min-h-60 items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <LoaderCircle className="h-10 w-10 animate-spin text-[#1c352b]" />
        <p className="text-sm text-[#1c352b]/70">Loading books...</p>
      </div>
    </div>
  );
}