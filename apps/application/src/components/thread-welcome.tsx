"use client";

import {
  Suggestion,
  Suggestions,
} from "@humblebrag/ui/components/ai-elements/suggestion";
import { ChevronRightIcon } from "@humblebrag/ui/components/icons";
import { motion } from "@humblebrag/ui/components/motion";
import { Button } from "@humblebrag/ui/components/ui/button";

export const ThreadWelcome = () => {
  return (
    <div className="mx-auto my-auto flex w-full grow flex-col">
      <div className="flex w-full grow flex-col items-center justify-center">
        <motion.div
          className="flex size-full flex-col justify-center gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div>
            <h1 className="font-semibold text-2xl">Welcome!</h1>
            <p className="text-muted-foreground text-xl">
              Let's create your career profile together.
            </p>
          </div>
          <ThreadSuggestions />
        </motion.div>
      </div>
    </div>
  );
};

const SUGGESTIONS = ["Let's get started"] as const;

const handleSuggestionClick = (suggestion: string) => {
  console.log("Selected suggestion:", suggestion);
};

export const ThreadSuggestions = () => {
  return (
    <Suggestions className="fade-in slide-in-from-bottom-2 animate-in delay-100 duration-200 fill-mode-both">
      {SUGGESTIONS.map((suggestion) => (
        <Suggestion
          asChild
          key={suggestion}
          onClick={handleSuggestionClick}
          suggestion={suggestion}
          size="lg"
        >
          <span className="font-medium">{suggestion}</span>
        </Suggestion>
      ))}
    </Suggestions>
  );
};
