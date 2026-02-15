import { ThreadWelcome } from "@/components/thread-welcome";
import { getQueryClient, trpc } from "@/trpc/server";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Todos | Humblebrag",
};

export default async function Page() {
  const queryClient = getQueryClient();
  const chats = await queryClient.fetchQuery(
    trpc.chat.getThreads.queryOptions({
      agentId: "profileAgent",
      resourceId: "default",
    }),
  );

  if (chats.total === 0) {
    return (
      <div className="flex min-h-screen justify-center items-center overflow-hidden p-6 md:p-0">
        <div className="relative z-20 m-auto flex w-full flex-col">
          <ThreadWelcome />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen justify-center items-center overflow-hidden p-6 md:p-0">
      <div className="relative z-20 m-auto flex w-full flex-col">
        <h1 className="font-semibold text-2xl">Your Chats</h1>
        <div className="mt-4 flex flex-col gap-4">
          {chats.threads.map((thread) => (
            <Link
              key={thread.id}
              href={`/${thread.id}`}
              className="block rounded-lg border border-muted p-4 hover:bg-muted"
            >
              {thread.id}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
