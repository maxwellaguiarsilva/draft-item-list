import { auth } from "../auth";
import { UnauthorizedError } from "./errors";

/**
 * Higher-Order Function (HOC) to wrap Server Actions with authentication.
 * It enforces that the action is only executed if the user is authenticated.
 */
export function withAuth<T extends any[], R>(
  handler: (userId: string, ...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const session = await auth();
    if (!session?.user?.id) {
      throw new UnauthorizedError();
    }
    
    return await handler(session.user.id, ...args);
  };
}
