import type { Metadata, Viewport } from "next";
import { Playfair_Display, DM_Sans, JetBrains_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ServiceWorkerRegistration } from "@/components/shared/ServiceWorkerRegistration";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  weight: ["400", "600", "700"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["400", "500", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const viewport: Viewport = {
  themeColor: "#7c3aed",
};

export const metadata: Metadata = {
  title: {
    default: "TattooVision AI",
    template: "%s | TattooVision AI",
  },
  description:
    "Plataforma de marketing con IA para estudios de tatuaje. Gestiona leads, agenda, campañas Meta y contenido desde un solo lugar.",
  keywords: ["tattoo", "marketing", "IA", "estudio de tatuaje", "Meta Ads"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TattooVision AI",
  },
  icons: {
    apple: "/logo.jpeg",
  },
};

// Clerk appearance — TattooVision AI dark theme
const clerkAppearance = {
  variables: {
    colorBackground: "#000000",
    colorPrimary: "#8B00FF",
    colorText: "#ffffff",
    colorTextSecondary: "#C084FC",
    colorInputBackground: "#1A0025",
    colorInputText: "#ffffff",
    colorNeutral: "#2D0050",
    colorDanger: "#FF6B6B",
    borderRadius: "0.5rem",
    fontFamily: "var(--font-dm-sans), system-ui, sans-serif",
  },
  elements: {
    card: {
      backgroundColor: "#0D0010",
      border: "1px solid #2D0050",
      boxShadow: "0 0 40px rgba(139,0,255,0.1)",
    },
    headerTitle: {
      fontFamily: "var(--font-playfair), serif",
      color: "#ffffff",
    },
    formButtonPrimary: {
      backgroundColor: "#8B00FF",
    },
    footerActionLink: { color: "#C084FC" },
    dividerLine: { backgroundColor: "#2D0050" },
    dividerText: { color: "#C084FC" },
    formFieldErrorText: { color: "#FF6B6B" },
    formFieldWarningText: { color: "#FBBF24" },
    identityPreviewEditButton: { color: "#C084FC" },
  },
} as const;

// ClerkProvider is only mounted when a valid publishable key is configured.
// During development without keys, auth pages show a setup prompt.
const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;
const isClerkConfigured =
  typeof clerkKey === "string" &&
  (clerkKey.startsWith("pk_test_") || clerkKey.startsWith("pk_live_"));

function Providers({ children }: { children: React.ReactNode }) {
  if (!isClerkConfigured) return <>{children}</>;
  return (
    <ClerkProvider publishableKey={clerkKey!} appearance={clerkAppearance}>
      {children}
    </ClerkProvider>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      <html
        lang="es"
        className={`dark ${playfair.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
        suppressHydrationWarning
      >
        <body className="font-sans antialiased bg-background text-foreground min-h-screen">
          <ServiceWorkerRegistration />
          {children}
        </body>
      </html>
    </Providers>
  );
}
