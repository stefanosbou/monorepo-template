"use client";

import { SUPPORT_EMAIL } from "@/utils/constants";
import { Button } from "@humblebrag/ui/components/button";
import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // useEffect(() => {
  //   if (process.env.NODE_ENV === "production") {
  //     import("@sentry/nextjs").then((Sentry) => {
  //       Sentry.captureException(error);
  //     });
  //   }
  // }, [error]);

  return (
    <div className="h-[calc(100vh-200px)] w-full flex items-center justify-center">
      <div className="max-w-md w-full text-center px-4">
        <h2 className="font-medium mb-4">Something went wrong</h2>
        <p className="text-sm text-[#878787] mb-6">
          We've been notified and are looking into it.
          <br />
          If this issue persists, please reach out to our{" "}
          <Link
            className="text-primary underline"
            href={`mailto:${SUPPORT_EMAIL}`}
          >
            support team
          </Link>
        </p>

        <Button onClick={() => reset()} variant="outline">
          Try again
        </Button>

        {error.digest && (
          <p className="text-xs text-[#4a4a4a] mt-4">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
