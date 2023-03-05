import type { PropsWithChildren } from "react";
import "../styles/globals.css";

export const metadata = {
  title: "puhack.horse",
};

async function Layout({ children }: PropsWithChildren<{}>) {
  return (
    <html lang="en-US">
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1, maximum-scale=1"
      />
      <body>{children}</body>
    </html>
  );
}

export default Layout;
