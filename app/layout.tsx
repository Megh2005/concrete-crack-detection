import type { Metadata } from "next";
import "./globals.css";
import { Roboto_Slab } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import BackgroundPattern from "@/components/BackgroundPattern";
import NavigationDock from "@/components/NavigationDock";

const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
  variable: "--font-roboto-slab",
  display: "swap",
});

export const metadata: Metadata = {
  title: "STRUCTURAL CV | Automated Concrete Defect & Crack Inspection Platform",
  description: "Enterprise computer vision and artificial intelligence infrastructure for concrete damage assessment, crack width measurement, and structural compliance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light">
      <body className={`${robotoSlab.className} ${robotoSlab.variable} bg-white text-slate-900 min-h-screen antialiased selection:bg-blue-600 selection:text-white font-sans pb-20`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <BackgroundPattern />
          {children}
          <NavigationDock />
        </ThemeProvider>
        <Toaster duration={2000} position="top-right" theme="light" />
      </body>
    </html>
  );
}
