"use client";

import { useActionState } from "react";
import { createList } from "../app/actions/list";

export function ListForm() {
  const [state, action, pending] = useActionState(async (prevState: any, formData: FormData) => {
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    if (!name || !category) return;
    await createList({ name, category });
  }, null);

  return (
    <form action={action} className="p-4 border rounded">
      <input name="name" placeholder="List Name" required className="border p-2" />
      <input name="category" placeholder="Category" required className="border p-2" />
      <button type="submit" disabled={pending} className="bg-blue-500 text-white p-2">
        {pending ? "Creating..." : "Create List"}
      </button>
    </form>
  );
}
