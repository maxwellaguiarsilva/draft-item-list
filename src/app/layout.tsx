import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { Notifications } from "@/components/Notifications";
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
      <body className="min-h-screen">
        <Providers>
          <Notifications />
          {children}
        </Providers>
      </body>
    </html>
  );
}
