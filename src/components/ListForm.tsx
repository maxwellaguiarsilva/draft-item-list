"use client";

import { useActionState, useEffect, useState } from "react";
import { createList, getCategories } from "../app/actions/list";

export function ListForm() {
  const [categories, setCategories] = useState<string[]>([]);
  const [, action, pending] = useActionState(async (_prevState: unknown, formData: FormData) => {
    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    if (!name || !category) return;
    await createList({ name, category });
  }, null);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  return (
    <form action={action} className="form-container" style={{ border: '1px solid var(--border-color)', borderRadius: '4px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <input 
        name="name" 
        placeholder="List Name" 
        required 
        className="input-field" 
        style={{ width: '100%', boxSizing: 'border-box' }}
      />
      <div style={{ position: 'relative' }}>
        <input 
          name="category" 
          placeholder="Category" 
          list="existing-categories"
          required 
          className="input-field" 
          style={{ width: '100%', boxSizing: 'border-box' }}
        />
        <datalist id="existing-categories">
          {categories.map(cat => (
            <option key={cat} value={cat} />
          ))}
        </datalist>
      </div>
      <button type="submit" disabled={pending} className="primary-button" style={{ width: '100%' }}>
        {pending ? "Creating..." : "Create List"}
      </button>
    </form>
  );
}
