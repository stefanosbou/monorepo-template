import { Button } from "@humblebrag/ui/components/ui/button";
import { Input } from "@humblebrag/ui/components/ui/input";
import type React from "react";
import { useState } from "react";

interface UserInputFormProps {
  message: string;
  inputType: string;
  onSubmit: (value: string) => void;
  disabled?: boolean;
}

export function UserInputForm({
  message,
  inputType,
  onSubmit,
  disabled = false,
}: UserInputFormProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onSubmit(value.trim());
      setValue("");
    }
  };

  return (
    <div className="my-4 p-4 border rounded-lg bg-muted/50">
      <p className="text-sm mb-3 text-muted-foreground">{message}</p>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={
            inputType === "location"
              ? "Enter location (e.g., London, New York)"
              : "Enter value"
          }
          className="flex-1"
          disabled={disabled}
          autoFocus
        />
        <Button type="submit" disabled={disabled || !value.trim()}>
          Submit
        </Button>
      </form>
    </div>
  );
}
