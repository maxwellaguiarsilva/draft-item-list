import { auth, signIn, signOut } from "@/auth";
import Image from "next/image";

export default async function Home() {
  const session = await auth();

  if (session) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        {session.user?.image && (
          <Image
            src={session.user.image}
            alt="User profile"
            width={100}
            height={100}
            className="rounded-full"
          />
        )}
        <h1 className="text-4xl font-bold">Welcome, {session.user?.name}</h1>
        <p className="text-xl text-gray-600">{session.user?.email}</p>
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
        >
          <button
            type="submit"
            className="cursor-pointer rounded-lg bg-error px-8 py-4 text-2xl font-bold text-text transition hover:bg-red-700"
          >
            Sign out
          </button>
        </form>
      </div>
    );
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
