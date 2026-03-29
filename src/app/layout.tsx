import type { Metadata } from "next";
import { Providers } from "@/components/Providers";
import { Notifications } from "@/components/Notifications";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="en" className={cn("font-sans", inter.variable, "dark")}>
      <body className="min-h-screen">
        <Providers>
          <Notifications />
          {children}
        </Providers>
      </body>
    </html>
  );
}
