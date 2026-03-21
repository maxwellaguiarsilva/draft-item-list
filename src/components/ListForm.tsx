"use client";

import { useActionState, useEffect, useState } from "react";
import { useAppContext } from "../context/AppContext";
import { createList, getCategories } from "../app/actions/list";

export function ListForm() {
  const [categories, setCategories] = useState<string[]>([]);
  const { addNotification } = useAppContext();
  const [, action, pending] = useActionState(async (_prevState: unknown, formData: FormData) => {
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    if (!name || !category) return;
    const result = await createList({ name, category });
    if (!result.success) {
      addNotification(result.error, 'error');
    } else {
      addNotification("List created successfully", 'success');
    }
  }, null);

  useEffect(() => {
    getCategories()
      .then((result) => {
        if (result.success) {
          setCategories(result.data);
        } else {
          addNotification(result.error, 'error');
        }
      })
      .catch((error) => {
        addNotification(error instanceof Error ? error.message : "Failed to load categories", 'error');
      });
  }, []);

  return (
    <form action={action} className="flex flex-col gap-2 border border-border rounded p-4">
      <input 
        name="name" 
        placeholder="List Name" 
        required 
        className="bg-bg border border-border text-text p-2 rounded w-full box-border"
      />
      <div className="relative">
        <input 
          name="category" 
          placeholder="Category" 
          list="existing-categories"
          required 
          className="bg-bg border border-border text-text p-2 rounded w-full box-border"
        />
        <datalist id="existing-categories">
          {categories.map(cat => (
            <option key={cat} value={cat} />
          ))}
        </datalist>
      </div>
      <button type="submit" disabled={pending} className="bg-text text-bg border-none p-2 rounded cursor-pointer font-bold w-full disabled:opacity-50">
        {pending ? "Creating..." : "Create List"}
      </button>
    </form>
  );
}
