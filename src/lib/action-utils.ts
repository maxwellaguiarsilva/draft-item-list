import { auth } from "../auth";

export type Result<T> = 
  | { success: true; data: T } 
  | { success: false; error: string };

/**
 * Higher-Order Function (HOC) to wrap Server Actions with authentication.
 * It enforces that the action is only executed if the user is authenticated.
 */
export function withAuth<T extends any[], R>(
  handler: (userId: string, ...args: T) => Promise<R>
) {
  return async (...args: T): Promise<Result<R>> => {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }
    
    try {
      const data = await handler(session.user.id, ...args);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : "Internal Error" };
    }
  };
}
