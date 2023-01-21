"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      className="mt-4 border-2 border-black rounded-lg p-1 font-bold"
      onClick={() => signOut()}
    >
      Sign Out
    </button>
  );
}
