"use client";

import { signOut } from "next-auth/react";
import { User } from "../types/types";

export default function SignOutButton({ user }: { user: User }) {
  return (
    <div className="clear-both mb-12 m-4">
      <div className="flex flex-col float-right">
        <div className="flex flex-row gap-1 items-center">
          <img className="rounded-full" src={user?.image || ""} width="32px" />
          <p className="font-bold">{user?.name}</p>
        </div>
        <button
          className="border-2 border-black rounded-sm px-1 text-sm font-bold w-fit ml-auto hover:bg-gray-600 hover:text-white transition hover:border-gray-600"
          onClick={() => signOut()}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
