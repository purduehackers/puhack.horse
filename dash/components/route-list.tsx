"use client";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import useSWR from "swr";
import { fetcher, server } from "../lib/helpers";
import { ConfigData, User } from "../types/types";
import Add from "./add";
import EmojiMarquee from "./emoji-marquee";
import Listing from "./listing";
import UserInfo from "./user-info";

const RouteList = ({
  fallbackData,
  user,
}: {
  fallbackData: ConfigData[];
  user: User;
}) => {
  const { data } = useSWR(`${server}/api/dash`, fetcher, {
    suspense: true,
    fallbackData,
    refreshInterval: 10000,
  });

  const [fetchedBefore, setFetchedBefore] = useState(false);
  useEffect(() => {
    if (!fetchedBefore) setFetchedBefore(true);
  }, [data]);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  useEffect(() => {
    document.addEventListener("keydown", (e) => {
      if ((e.ctrlKey && e.shiftKey && e.key === "a") || e.key === "A") {
        setAddDialogOpen(true);
      }
    });
  });

  return (
    <div className="flex flex-col">
      <UserInfo user={user} />
      <div className="flex flex-col justify-center items-center">
        <div className="flex flex-col items-center lg:items-start justify-center lg:flex-row w-full lg:w-11/12 xl:w-full gap-x-8">
          <div className="flex flex-col gap-4 mx-4 max-w-sm">
            <h1 className="text-center text-amber-600 font-mono text-3xl sm:text-4xl font-bold">
              <span className="select-none inline-block shake">🐴</span>{" "}
              puhack.horse{" "}
              <span className="select-none inline-block shake">🐴</span>
            </h1>
            <hr className="h-1 border-0 bg-gray-600 rounded-sm" />
            <div className="flex flex-col gap-2">
              <p>
                this is the dashboard for purdue hackers' link shortener.
                welcome!!!
              </p>
              <p>
                to edit something, just click on it in the table. your changes
                will reflect on the dashboard immediately and update in edge
                config in the background. some operations may take up to 60
                seconds for the dashboard to recognize they've updated, but most
                of the time everything you change should be available instantly.
              </p>
            </div>
            <div className="flex justify-center">
              <EmojiMarquee large={true} />
            </div>
          </div>
          <EmojiMarquee />
          <div className="rounded-sm border-[3px] border-black w-11/12 sm:max-w-2xl tabular-nums shadow-container shadow-gray-900/70 overflow-y-auto mb-8 mt-4 lg:mt-0">
            <div className="py-1 flex flex-row bg-amber-500 border-b-[3px] border-b-black">
              <p className="font-bold text-center w-5/12 sm:w-1/4">route</p>
              <p className="flex-1 font-bold text-center pl-2">destination</p>
              <p className="sm:w-20"></p>
            </div>
            <div className="flex flex-col overflow-y-scroll max-h-[30rem]">
              {data.map((listing: ConfigData) => (
                <Listing
                  key={listing.route}
                  route={listing.route}
                  destination={listing.destination}
                  visits={listing.visits}
                  fallbackData={fallbackData}
                  fetchedBefore={fetchedBefore}
                  status={listing.status}
                />
              ))}
            </div>
            <Add
              open={addDialogOpen}
              setOpen={setAddDialogOpen}
              fallbackData={fallbackData}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteList;
