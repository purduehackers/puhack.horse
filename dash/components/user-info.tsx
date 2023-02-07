"use client";

import { signOut } from "next-auth/react";
import { User } from "../types/types";

export default function UserInfo({ user }: { user: User }) {
  return (
    <div className="clear-both mb-8 lg:mb-12 mt-4 mr-2 lg:mr-4 text-gray-800">
      <div className="flex flex-row float-right gap-1 items-center text-base">
        <img className="rounded-full" src={user?.image || ""} width="32px" />
        <p className="font-bold">{user?.name}</p> •
        <button
          className="rounded-sm px-1 font-bold w-fit border-2 border-gray-600 hover:bg-gray-600 hover:text-white transition duration-100"
          onClick={() => signOut()}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
