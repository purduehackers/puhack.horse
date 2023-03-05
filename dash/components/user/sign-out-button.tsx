"use client";
import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      className="rounded-sm px-1 font-bold w-fit border-2 border-gray-600 hover:bg-gray-600 hover:text-gray-100 transition duration-100"
      onClick={() => signOut()}
    >
      Sign Out
    </button>
  );
}
