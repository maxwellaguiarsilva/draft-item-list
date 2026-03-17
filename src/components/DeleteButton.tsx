"use client";

import { deleteList } from "../app/actions/list";
import { useTransition } from "react";

export function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      onClick={() => startTransition(() => deleteList(id))}
      disabled={isPending}
      className="text-red-500"
    >
      {isPending ? "Deleting..." : "Delete"}
    </button>
  );
}
