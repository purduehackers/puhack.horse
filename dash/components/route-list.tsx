"use client";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { fetcher, server } from "../lib/helpers";
import { ConfigData, User } from "../types/types";
import Add from "./add";
import Listing from "./listing";
import SignInModal from "./sign-in-modal/sign-in-modal";

const RouteList = ({
  fallbackData,
  user,
}: {
  fallbackData: ConfigData;
  user: User;
}) => {
  const { data } = useSWR<ConfigData>(`${server}/api/dash`, fetcher, {
    suspense: true,
    fallbackData,
  });

  const [signInModalOpen, setSignInModalOpen] = useState(false);

  const [fetchedBefore, setFetchedBefore] = useState(false);
  useEffect(() => {
    if (!fetchedBefore) setFetchedBefore(true);
  }, [data]);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  useEffect(() => {
    document.addEventListener("keydown", (e) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        (e.key === "a" || e.key === "A")
      ) {
        setAddDialogOpen(true);
      }
    });
  });

  return (
    <div className="rounded-sm border-[3px] border-black w-11/12 sm:max-w-2xl tabular-nums shadow-container shadow-gray-900/70 overflow-y-auto mb-8 mt-4 lg:mt-0">
      <div className="py-1 flex flex-row bg-amber-500 border-b-[3px] border-b-black">
        <p className="font-bold text-center w-5/12 sm:w-1/4">route</p>
        <p className="flex-1 font-bold text-center">destination</p>
        <p className="sm:w-20"></p>
      </div>
      <div className="flex flex-col overflow-y-scroll max-h-[30rem]">
        {data &&
          Object.keys(data).map((route: string) => (
            <Listing
              user={user}
              key={route}
              route={route}
              destination={data[route].destination}
              visits={data[route].visits}
              fallbackData={fallbackData}
              fetchedBefore={fetchedBefore}
              status={data[route].status}
              setSignInModalOpen={setSignInModalOpen}
            />
          ))}
      </div>
      {user ? (
        <Add
          open={addDialogOpen}
          setOpen={setAddDialogOpen}
          fallbackData={fallbackData}
        />
      ) : (
        <>
          <SignInModal open={signInModalOpen} setOpen={setSignInModalOpen} />
          <div
            className="py-2 pl-2 bg-amber-500 font-bold flex flex-row items-center gap-1 hover:bg-amber-400 transition duration-100 cursor-pointer sticky w-full bottom-0 border-t-[3px] border-black"
            onClick={() => setSignInModalOpen(true)}
          >
            <Plus />
            <p>add</p>
          </div>
        </>
      )}
    </div>
  );
};

export default RouteList;
