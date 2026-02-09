"use client";

import { Button } from "@humblebrag/ui/components/button";

export const ClientComponent = () => {
  return (
    <Button
      size="default"
      onClick={() => alert("Hello from the Button component!")}
    >
      Click me
    </Button>
  );
};
