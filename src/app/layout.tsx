import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Midhula Farm Hut | Ornamental Fish in Peechi, Kerala",
  description:
    "Discover the fascinating beauty of ornamental fish at Midhula Farm Hut in Peechi, Thrissur, Kerala.",
  openGraph: {
    title: "Midhula Farm Hut | A Little World of Extraordinary Life",
    description:
      "Ornamental fish, guppies and platies from Peechi, Thrissur, Kerala.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
