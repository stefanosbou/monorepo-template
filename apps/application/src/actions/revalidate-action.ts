"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function revalidateAfterTodoChange() {
  // Revalidate the layout and all pages that depend on user/team data
  revalidatePath("/", "layout"); // This revalidates the entire layout
  revalidatePath("/"); // Revalidate the root page
  revalidatePath("/todos"); // Revalidate todos page

  // Redirect to home after revalidating
  redirect("/");
}
