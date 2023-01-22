"use client";
import { signIn } from "next-auth/react";

export default function SignInButton() {
  return (
    <button
      className="p-2 text-lg font-bold bg-blue-300 hover:bg-blue-400 border-2 border-black rounded-lg transition duration-100"
      onClick={() => signIn("github")}
    >
      Sign In with GitHub
    </button>
  );
}
