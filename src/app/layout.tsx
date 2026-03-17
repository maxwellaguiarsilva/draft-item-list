import type { Metadata } from "next";
import { Sidebar } from "@/components/Sidebar";
import { Providers } from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Draft Item List",
  description: "Simple list management tool.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex h-screen overflow-hidden">
        <Providers>
          <Sidebar />
          <main className="flex-1 overflow-y-auto bg-black text-white p-6">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
