import type { Metadata } from "next";
import { Parkinsans, Titillium_Web } from "next/font/google"; // Verify imports work
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider"
import { FloatingChatTrigger } from "@/components/aseec-ia/floating-chat-trigger"

const parkinsans = Parkinsans({
  variable: "--font-parkinsans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const titillium = Titillium_Web({
  variable: "--font-titillium",
  subsets: ["latin"],
  weight: ["200", "300", "400", "600", "700", "900"],
});

export const metadata: Metadata = {
  title: "ASEEC App",
  description: "Gerenciamento estratégico de projetos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${titillium.variable} ${parkinsans.variable} antialiased font-sans`}
      >
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <FloatingChatTrigger />
          </ThemeProvider>
      </body>
    </html>
  );
}
