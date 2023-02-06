"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      className="float-right m-4 border-2 border-black rounded-lg p-1 font-bold w-fit"
      onClick={() => signOut()}
    >
      Sign Out
    </button>
  );
}
