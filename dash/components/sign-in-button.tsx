"use client";
import { signIn } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      className="rounded-sm px-1 font-bold w-fit border-2 border-gray-600 hover:bg-gray-600 hover:text-gray-100 transition duration-100"
      id="sign-in-button"
      onClick={() => {
        signIn("github");
        const button = document.getElementById("sign-in-button");
        if (button) button.innerHTML = "Signing in...";
      }}
    >
      Sign In
    </button>
  );
}
