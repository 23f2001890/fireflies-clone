import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "Fireflight — Meeting Notes & Transcripts",
  description: "A Fireflies.ai-inspired meeting assistant clone.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ToastProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 min-w-0">{children}</div>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
