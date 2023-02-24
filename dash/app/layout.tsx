import type { PropsWithChildren } from "react";
import "../styles/globals.css";

export const metadata = {
  title: "puhack.horse",
};

async function Layout({ children }: PropsWithChildren<{}>) {
  return (
    <html lang="en-US">
      <body>{children}</body>
    </html>
  );
}

export default Layout;
