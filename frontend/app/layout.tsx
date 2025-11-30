import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { GlobalProvider } from "@/context/GlobalContext";
import { Toaster } from "react-hot-toast";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Loan Manager - Зээлийн удирдлагын систем",
  description: "Хувийн зээлээ удирдах, хянах, түүхийг харах систем",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn">
      <body className={`${roboto.variable} antialiased font-sans`}>
        <GlobalProvider>
          {children}
          <Toaster position="top-center" />
        </GlobalProvider>
      </body>
    </html>
  );
}
