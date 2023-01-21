import type { PropsWithChildren } from "react";
import "../styles/globals.css";

async function Layout({ children }: PropsWithChildren<{}>) {
  return (
    <html lang="en-US">
      <head />
      <body>{children}</body>
    </html>
  );
}

export default Layout;
