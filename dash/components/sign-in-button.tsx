"use client";
import { signIn } from "next-auth/react";

export default function SignInButton() {
  return (
    <button
      className="p-2 text-lg font-bold bg-amber-500 hover:bg-amber-400 border-2 border-black rounded-lg transition duration-100"
      onClick={() => signIn("github")}
    >
      Sign In with GitHub
    </button>
  );
}
