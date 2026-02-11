import { CreateTodo } from "@/components/create-todo";
import { HydrateClient, getQueryClient, trpc } from "@/trpc/server";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Todos | Humblebrag",
};

export default async function Todos() {
  const queryClient = getQueryClient();
  const todos = await queryClient.fetchQuery(trpc.todos.getAll.queryOptions());

  return (
    <HydrateClient>
      <header className="w-full absolute left-0 right-0 flex justify-between items-center">
        <div className="p-6">
          <Link href="/">LOGO</Link>
        </div>

        {/* <div className="mr-6 mt-4">
          <UserMenu onlySignOut />
        </div> */}
      </header>

      <div className="flex min-h-screen justify-center items-center overflow-hidden p-6 md:p-0">
        <div className="relative z-20 m-auto flex w-full max-w-[480px] flex-col">
          <div>
            <div className="text-center">
              <h1 className="text-lg mb-2 font-serif">Welcome</h1>
            </div>
          </div>

          {/* If there are teams, show them */}
          {todos?.length && (
            <>
              <span className="text-sm text-[#878787] mb-4">Todos</span>
              <div className="max-h-[260px] overflow-y-auto">
                <p>{JSON.stringify(todos, null, 2)}</p>
              </div>
            </>
          )}

          <div className="text-center mt-12 border-t-[1px] border-border pt-6 w-full relative border-dashed">
            <span className="absolute left-1/2 -translate-x-1/2 text-sm text-[#878787] bg-background -top-3 px-4">
              Or
            </span>
            <CreateTodo />
          </div>
        </div>
      </div>
    </HydrateClient>
  );
}
