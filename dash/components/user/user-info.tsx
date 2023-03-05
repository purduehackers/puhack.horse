import { signOut } from "next-auth/react";
import { User } from "../../types/types";
import SignInButton from "../sign-in-button";
import SignOutButton from "./sign-out-button";

export default function UserInfo({ user }: { user: User }) {
  return (
    <div className="clear-both mb-8 lg:mb-12 mt-4 mr-2 lg:mr-4 text-gray-800">
      <div className="flex flex-row float-right gap-1 items-center text-sm">
        {user ? (
          <>
            <img
              className="rounded-full"
              src={user?.image || ""}
              width="32px"
            />
            <p className="font-bold">{user?.name}</p> •
            <SignOutButton />
          </>
        ) : (
          <>
            <p className="font-bold">Not signed in •</p>
            <SignInButton />
          </>
        )}
      </div>
    </div>
  );
}
