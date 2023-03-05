"use client";
import { signIn } from "next-auth/react";

export default function SignInButton() {
  return (
    <button
      id="sign-in-button-modal"
      className="bg-amber-100 text-amber-700 disabled:bg-mauve4 disabled:text-mauve11 hover:bg-amber-200 focus:shadow-black inline-flex h-[35px] items-center justify-center rounded-sm border-2 border-black focus:border-[2.5px] shadow-button shadow-gray-800/80 px-[15px] font-medium leading-none focus:outline-none"
      onClick={() => {
        signIn("github");
        const button = document.getElementById("sign-in-button-modal");
        if (button) button.innerHTML = "Signing in...";
      }}
    >
      Sign In
    </button>
  );
}
