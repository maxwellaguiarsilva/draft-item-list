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
    <form action={action} className="form-container" style={{ border: '1px solid var(--border-color)', borderRadius: '4px' }}>
      <input name="name" placeholder="List Name" required className="input-field" />
      <input name="category" placeholder="Category" required className="input-field" />
      <button type="submit" disabled={pending} className="primary-button">
        {pending ? "Creating..." : "Create List"}
      </button>
    </form>
  );
}
