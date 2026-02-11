"use client";

import { useChat } from "@humblebrag/ai/ai-sdk";
import {
  DefaultChatTransport,
  type ToolUIPart,
  type UIDataTypes,
  type UIMessage,
  type UITools,
  lastAssistantMessageIsCompleteWithToolCalls,
} from "@humblebrag/ai/mastra";
import { memo, useCallback, useEffect, useState } from "react";

import type { PromptInputMessage } from "@humblebrag/ui/components/ai-elements/prompt-input";

import {
  Attachment,
  AttachmentPreview,
  AttachmentRemove,
  Attachments,
} from "@humblebrag/ui/components/ai-elements/attachments";
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorLogo,
  ModelSelectorLogoGroup,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@humblebrag/ui/components/ai-elements/model-selector";
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputBody,
  PromptInputButton,
  PromptInputFooter,
  PromptInputHeader,
  PromptInputProvider,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputTools,
  usePromptInputAttachments,
} from "@humblebrag/ui/components/ai-elements/prompt-input";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@humblebrag/ui/components/ai-elements/conversation";

import {
  Message,
  MessageContent,
  MessageResponse,
} from "@humblebrag/ui/components/ai-elements/message";

import {
  Tool,
  ToolContent,
  ToolHeader,
  ToolInput,
  ToolOutput,
} from "@humblebrag/ui/components/ai-elements/tool";
import { CheckIcon, GlobeIcon } from "@humblebrag/ui/components/icons";
import { UserInputForm } from "./user-input-form";

const models = [
  {
    chef: "OpenAI",
    chefSlug: "openai",
    id: "gpt-4o",
    name: "GPT-4o",
    providers: ["openai", "azure"],
  },
  {
    chef: "OpenAI",
    chefSlug: "openai",
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    providers: ["openai", "azure"],
  },
  {
    chef: "Anthropic",
    chefSlug: "anthropic",
    id: "claude-opus-4-20250514",
    name: "Claude 4 Opus",
    providers: ["anthropic", "azure", "google", "amazon-bedrock"],
  },
  {
    chef: "Anthropic",
    chefSlug: "anthropic",
    id: "claude-sonnet-4-20250514",
    name: "Claude 4 Sonnet",
    providers: ["anthropic", "azure", "google", "amazon-bedrock"],
  },
  {
    chef: "Google",
    chefSlug: "google",
    id: "gemini-2.0-flash-exp",
    name: "Gemini 2.0 Flash",
    providers: ["google"],
  },
];

interface AttachmentItemProps {
  attachment: {
    id: string;
    type: "file";
    filename?: string;
    mediaType?: string;
    url: string;
  };
  onRemove: (id: string) => void;
}

const AttachmentItem = memo(({ attachment, onRemove }: AttachmentItemProps) => {
  const handleRemove = useCallback(
    () => onRemove(attachment.id),
    [onRemove, attachment.id],
  );
  return (
    <Attachment
      data={{
        ...attachment,
        mediaType: attachment.mediaType ?? "",
      }}
      key={attachment.id}
      onRemove={handleRemove}
    >
      <AttachmentPreview />
      <AttachmentRemove />
    </Attachment>
  );
});

AttachmentItem.displayName = "AttachmentItem";

interface ModelItemProps {
  m: (typeof models)[0];
  selectedModel: string;
  onSelect: (id: string) => void;
}

const ModelItem = memo(({ m, selectedModel, onSelect }: ModelItemProps) => {
  const handleSelect = useCallback(() => onSelect(m.id), [onSelect, m.id]);
  return (
    <ModelSelectorItem key={m.id} onSelect={handleSelect} value={m.id}>
      <ModelSelectorLogo provider={m.chefSlug} />
      <ModelSelectorName>{m.name}</ModelSelectorName>
      <ModelSelectorLogoGroup>
        {m.providers.map((provider) => (
          <ModelSelectorLogo key={provider} provider={provider} />
        ))}
      </ModelSelectorLogoGroup>
      {selectedModel === m.id ? (
        <CheckIcon className="ml-auto size-4" />
      ) : (
        <div className="ml-auto size-4" />
      )}
    </ModelSelectorItem>
  );
});

ModelItem.displayName = "ModelItem";

const PromptInputAttachmentsDisplay = () => {
  const attachments = usePromptInputAttachments();

  const handleRemove = useCallback(
    (id: string) => attachments.remove(id),
    [attachments],
  );

  if (attachments.files.length === 0) {
    return null;
  }

  return (
    <Attachments variant="inline">
      {attachments.files.map((attachment) => (
        <AttachmentItem
          attachment={attachment}
          key={attachment.id}
          onRemove={handleRemove}
        />
      ))}
    </Attachments>
  );
};

interface PendingInput {
  type: string;
  message: string;
  toolCallId?: string;
  tool: string;
}

function Chat() {
  const [input, setInput] = useState<string>("");
  const [pendingInput, setPendingInput] = useState<PendingInput | null>(null);

  const {
    messages,
    setMessages,
    addToolOutput,
    addToolResult,
    resumeStream,
    sendMessage,
    addToolApprovalResponse,
    status,
  } = useChat({
    transport: new DefaultChatTransport({
      api: `${process.env.NEXT_PUBLIC_API_URL}/chat`,
      prepareSendMessagesRequest: ({ id, messages }) => {
        return {
          body: {
            id,
            messages: [messages[messages.length - 1]],
          },
        };
      },
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    onFinish: (event) => {
      checkForPendingInput(event.message);
      // checkForEndSignal(event.message);
    },
  });

  const checkForPendingInput = (
    message: UIMessage<unknown, UIDataTypes, UITools>,
  ) => {
    if (message.parts) {
      for (const part of message.parts) {
        const toolPart = part as any;
        if (part.type === "data-tool-call-suspended" && toolPart.data) {
          const toolData = toolPart.data;

          // Check if any part with the same toolCallId has an output
          // Tool parts have toolCallId at root level, suspended parts have it in data
          const hasOutput = message.parts.some((p: any) => {
            const matchesToolCallId =
              p.toolCallId === toolData.toolCallId ||
              p.data?.toolCallId === toolData.toolCallId;

            return (
              matchesToolCallId && (p.output || p.state === "output-available")
            );
          });

          // Only set as pending if no output exists for this toolCallId
          if (toolData.suspendPayload?.question && !hasOutput) {
            setPendingInput({
              type: toolData.toolName,
              message: toolData.suspendPayload.question,
              toolCallId: toolData.toolCallId,
              tool: toolData.toolName,
            });
            break; // Exit loop after finding first suspended tool
          }
        }
      }
    }
  };

  useEffect(() => {
    const fetchMessages = async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat`);
      const data = await res.json();
      setMessages([...data]);
    };
    fetchMessages();
  }, []);

  const [model, setModel] = useState<string>(models[0]?.id || "");
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);

  const selectedModelData = models.find((m) => m.id === model);

  const handleModelSelect = useCallback((id: string) => {
    setModel(id);
    setModelSelectorOpen(false);
  }, []);

  const handleSubmit = useCallback((message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    sendMessage(message);
    setInput("");
  }, []);

  const handleUserInputSubmit = async (value: string) => {
    if (!pendingInput) return;

    await addToolResult({
      tool: pendingInput.tool,
      toolCallId: pendingInput.toolCallId!,
      output: {
        data: {
          city: value,
        },
      },
    });

    setMessages((prev) => {
      // Update the messages, keep all but the last one, and replace the last one with a new object that has the same content but with the tool part updated with the output
      const lastMessage = prev[prev.length - 1];
      if (!lastMessage) return prev;

      const messages = prev.slice(0, -1);

      return messages;
    });

    setPendingInput(null);
  };

  const isInputDisabled = status !== "ready" || pendingInput !== null;

  return (
    <div className="w-full p-6 relative size-full h-screen">
      <div className="flex flex-col h-full">
        <Conversation className="h-full">
          <ConversationContent>
            {messages.map((message) => (
              <div key={message.id}>
                {message.parts?.map((part, i) => {
                  if (part.type === "text") {
                    return (
                      <Message key={`${message.id}-${i}`} from={message.role}>
                        <MessageContent>
                          <MessageResponse>{part.text}</MessageResponse>
                        </MessageContent>
                      </Message>
                    );
                  }

                  if (part.type?.startsWith("tool-")) {
                    const toolPart = part as ToolUIPart;

                    return (
                      <div key={`${message.id}-${i}`}>
                        <Tool>
                          <ToolHeader
                            type={toolPart.type}
                            state={toolPart.state || "output-available"}
                            className="cursor-pointer"
                          />
                          <ToolContent>
                            <ToolInput input={toolPart.input || {}} />
                            <ToolOutput
                              output={toolPart.output}
                              errorText={toolPart.errorText}
                            />
                          </ToolContent>
                        </Tool>
                      </div>
                    );
                  }

                  return null;
                })}
              </div>
            ))}
            {pendingInput && (
              <UserInputForm
                message={pendingInput.message}
                inputType={pendingInput.type}
                onSubmit={handleUserInputSubmit}
                disabled={status !== "ready"}
              />
            )}
            <ConversationScrollButton />
          </ConversationContent>
        </Conversation>

        {/* {JSON.stringify(messages, null, 2)} */}

        <PromptInput onSubmit={handleSubmit} globalDrop multiple>
          {/* TODO: Conditional rendering of attachments display in the header */}
          {/*
					<PromptInputHeader>
            <PromptInputAttachmentsDisplay />
          </PromptInputHeader> 
					*/}
          <PromptInputBody>
            <PromptInputTextarea
              onChange={(e) => setInput(e.target.value)}
              value={input}
              placeholder={
                pendingInput
                  ? "Please answer the question above..."
                  : "Type your message..."
              }
              disabled={isInputDisabled}
            />
          </PromptInputBody>
          <PromptInputFooter>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
              <PromptInputButton
                onClick={() => {}}
                tooltip={{ content: "Search the web", shortcut: "⌘K" }}
                variant={"ghost"}
              >
                <GlobeIcon size={16} />
                <span>Search</span>
              </PromptInputButton>
              <ModelSelector
                onOpenChange={setModelSelectorOpen}
                open={modelSelectorOpen}
              >
                <ModelSelectorTrigger asChild>
                  <PromptInputButton>
                    {selectedModelData?.chefSlug && (
                      <ModelSelectorLogo
                        provider={selectedModelData.chefSlug}
                      />
                    )}
                    {selectedModelData?.name && (
                      <ModelSelectorName>
                        {selectedModelData.name}
                      </ModelSelectorName>
                    )}
                  </PromptInputButton>
                </ModelSelectorTrigger>
                <ModelSelectorContent>
                  <ModelSelectorInput placeholder="Search models..." />
                  <ModelSelectorList>
                    <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
                    {["OpenAI", "Anthropic", "Google"].map((chef) => (
                      <ModelSelectorGroup heading={chef} key={chef}>
                        {models
                          .filter((m) => m.chef === chef)
                          .map((m) => (
                            <ModelItem
                              key={m.id}
                              m={m}
                              onSelect={handleModelSelect}
                              selectedModel={model}
                            />
                          ))}
                      </ModelSelectorGroup>
                    ))}
                  </ModelSelectorList>
                </ModelSelectorContent>
              </ModelSelector>
            </PromptInputTools>
            <PromptInputSubmit disabled={!input && !status} status={status} />
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}

export default Chat;
