import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/Navigation";

export const metadata: Metadata = {
  title: "My Rituals",
  description: "Designer workflow rituals — weekly planning, daily ops, weekly review",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Navigation />
        <main className="lg:ml-56 min-h-screen bg-[#F7F7F7] pt-14 lg:pt-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
