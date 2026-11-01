import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import Navbar from "../components/Navbar";
import Footer from "@/components/Footer";
import ThemeProvider from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: {
    default: "BookNook | Your Little Corner of Books",
    template: "BookNook | %s",
  },
  description:
    "Discover, borrow, and explore books with BookNook.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider>
          <Navbar />
          {children}
          <Footer />
          <Toaster
            position="top-right"
            closeButton
            expand={false}
            toastOptions={{
              unstyled: true,
              classNames: {
                toast:
                  "group flex w-full items-center gap-3 rounded-xl border border-[#dfd8c8] bg-[#fffdf8] px-4 py-3 text-[#1c352b] shadow-lg",
                title: "text-sm font-semibold text-[#1c352b]",
                description: "text-xs text-[#77766d]",
                closeButton:
                  "border border-[#e7e1d5] bg-[#f8f7f2] text-[#1c352b] hover:bg-[#eeeade]",
                icon: "text-[#1c352b]",
                success: "border-l-4 border-l-[#1c352b]",
                error: "border-l-4 border-l-[#b45345]",
                info: "border-l-4 border-l-[#b89a5b]",
                warning: "border-l-4 border-l-[#b89a5b]",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}