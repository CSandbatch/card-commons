import type { Metadata, Viewport } from "next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Card Commons",
    template: "%s · Card Commons"
  },
  description: "A proposal for portable, editable, publishable, playable web objects.",
  metadataBase: new URL("https://csandbatch.github.io/card-commons/"),
  openGraph: {
    title: "Card Commons",
    description: "Make a card, not a website.",
    type: "website"
  }
};

export const viewport: Viewport = {
  themeColor: "#f4f0e7",
  colorScheme: "light"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <SiteHeader />
        <div id="main-content">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}

