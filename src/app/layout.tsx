import type { Metadata } from "next";
import { auth } from "@/auth";
import { Sidebar } from "@/components/Sidebar";
import { Providers } from "@/components/Providers";
import { listService } from "@/services";
import "./globals.css";

export const metadata: Metadata = {
  title: "Draft Item List",
  description: "Simple list management tool.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const lists = session?.user?.id ? await listService.getAll(session.user.id) : [];

  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden">
        <Providers>
          <Sidebar lists={lists} />
          <main className="flex-1 overflow-y-auto bg-black text-white p-6">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
