"use client";

import { deleteList } from "../app/actions/list";
import { useTransition } from "react";

export function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
   <button
     onClick={() => startTransition(async () => {
       const result = await deleteList(id);
       if (!result.success) console.error(result.error);
     })}
     disabled={isPending}
     className="text-red-500"
   >
     {isPending ? "Deleting..." : "Delete"}
   </button>
  );

}
