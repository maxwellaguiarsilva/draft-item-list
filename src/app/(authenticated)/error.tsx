"use client";

import { useEffect } from "react";
import { redirect } from "next/navigation";
import { UnauthorizedError } from "@/lib/errors";

export default function ErrorBoundary({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    if (error instanceof UnauthorizedError) {
      redirect("/");
    }
    // For other errors, we could log them or show an error UI
  }, [error]);

  return (
    <div className="flex h-full w-full items-center justify-center bg-bg text-text">
      <p>An unexpected error occurred. Please try again.</p>
    </div>
  );
}
