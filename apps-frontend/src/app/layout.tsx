import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ToastContainer } from "@/components/ui";

export const metadata: Metadata = {
  title: "Faraway LMS — Learn Without Limits",
  description:
    "A modern learning management system. Browse expert-led courses, track your progress, and achieve your goals with Faraway.",
  keywords: ["learning", "courses", "education", "LMS", "online learning"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Navbar />
        <main className="min-h-screen pt-16">{children}</main>
        <Footer />
        <ToastContainer />
      </body>
    </html>
  );
}
