"use client";

import { deleteList } from "../app/actions/list";
import { useAppAction } from "@/hooks/useAppAction";

export function DeleteButton({ id }: { id: string }) {
  const { execute, isPending } = useAppAction(deleteList);

  return (
   <button
     onClick={() => execute(id)}
     disabled={isPending}
     className="text-red-500"
   >
     {isPending ? "Deleting..." : "Delete"}
   </button>
  );
}
