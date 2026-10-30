import type { Metadata } from "next";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "BookNook | Your Little Corner of Books",
    template: "%s | BookNook",
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
    <html lang="en">
      <body className="antialiased">
        <Navbar />
        {children}
        <Footer></Footer>
      </body>
    </html>
  );
}