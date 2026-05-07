import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "روانكو للمنظفات - نظام الكاشير",
  description: "نظام إدارة محل روانكو للمنظفات",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        {children}
        <Toaster 
          position="top-left" 
          toastOptions={{
            style: {
              direction: "rtl",
              fontFamily: "system-ui, sans-serif",
            },
          }}
        />
      </body>
    </html>
  );
}