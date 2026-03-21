import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-black">
      <form
        action={async () => {
          "use server";
          await signIn("google");
        }}
      >
        <button
          type="submit"
          className="btn-base btn-xl btn-primary"
          aria-label="Sign in with your Google account"
        >
          Sign in with Google
        </button>
      </form>
    </div>
  );
}
