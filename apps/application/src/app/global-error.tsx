"use client";

import { SUPPORT_EMAIL } from "@/utils/constants";
import { Button } from "@humblebrag/ui/components/ui/button";
import { useEffect } from "react";
// suppress missing module/type declarations for this side-effect CSS import
// @ts-ignore
import "@humblebrag/ui/globals.css";
import Link from "next/link";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  // useEffect(() => {
  //   if (process.env.NODE_ENV === "production") {
  //     import("@sentry/nextjs").then((Sentry) => {
  //       Sentry.captureException(error);
  //     });
  //   }
  // }, [error]);

  return (
    <html lang="en">
      <body className="bg-background text-foreground antialiased">
        <div className="min-h-screen flex items-center justify-center">
          <div className="max-w-md w-full text-center px-4">
            <h2 className="font-medium mb-4">Oops! Something went wrong</h2>
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
              .
            </p>

            <Button onClick={() => window.location.reload()} variant="outline">
              Try again
            </Button>

            {error.digest && (
              <p className="text-xs text-[#4a4a4a] mt-4">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
