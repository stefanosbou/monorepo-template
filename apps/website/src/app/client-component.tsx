"use client";

import { Button } from "@humblebrag/ui/components/button";

export const ClientComponent = () => {
  return (
    <div className="flex flex-col items-center gap-4">
      <Button
        size="xl"
        onClick={() => alert("Hello from the Button component!")}
      >
        Deploy Now
      </Button>
    </div>
  );
};
