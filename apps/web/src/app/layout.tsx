import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import LoadingScreen from "@/components/ui/LoadingScreen";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0a0e17",
};

export const metadata: Metadata = {
  title: "Archon AI — Context-Aware Developer Assistant",
  description:
    "AI that understands your entire codebase. Trace bugs across files, analyze architecture, detect vulnerabilities, and generate fixes — powered by deep repository intelligence.",
  keywords: [
    "AI developer assistant",
    "code analysis",
    "bug detection",
    "architecture visualization",
    "API documentation",
    "repository intelligence",
    "Gemini AI",
    "developer tools",
  ],
  openGraph: {
    title: "Archon AI — Context-Aware Developer Assistant",
    description:
      "AI that understands your entire codebase. Trace bugs, analyze architecture, and generate fixes.",
    type: "website",
    locale: "en_US",
    siteName: "Archon AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "Archon AI — Context-Aware Developer Assistant",
    description:
      "AI that understands your entire codebase. Trace bugs, analyze architecture, and generate fixes.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} dark`}
    >
      <body className="font-sans antialiased bg-bg-primary text-text-primary min-h-screen relative">
        <LoadingScreen />
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f8fafc',
              border: '1px solid rgba(255,255,255,0.1)',
            },
            success: {
              iconTheme: { primary: '#34d399', secondary: '#0a0e17' },
            },
            error: {
              iconTheme: { primary: '#f43f5e', secondary: '#0a0e17' },
            },
          }}
        />
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
