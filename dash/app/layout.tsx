import type { PropsWithChildren } from "react";
import { Space_Grotesk, Space_Mono } from "next/font/google";
import "../styles/globals.css";

const SpaceGrotesk = Space_Grotesk({
  weight: ["400", "700"],
  variable: "--space-grotesk",
  subsets: ["latin"],
});
const SpaceMono = Space_Mono({
  weight: "400",
  variable: "--space-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "puhack.horse",
};

async function Layout({ children }: PropsWithChildren<{}>) {
  return (
    <html
      lang="en-US"
      className={`${SpaceGrotesk.variable} ${SpaceMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}

export default Layout;
