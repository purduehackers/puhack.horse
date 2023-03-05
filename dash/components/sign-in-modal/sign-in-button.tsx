"use client";
import { signIn } from "next-auth/react";

export default function SignInButton() {
  return (
    <button
      className="bg-amber4 text-amber11 disabled:bg-mauve4 disabled:text-mauve11 hover:bg-amber5 focus:shadow-black inline-flex h-[35px] items-center justify-center rounded-sm border-2 border-black focus:border-[2.5px] shadow-button shadow-gray-800/80 px-[15px] font-medium leading-none focus:outline-none"
      onClick={() => signIn("github")}
    >
      Sign In
    </button>
  );
}
