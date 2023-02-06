"use client";
import useSWR from "swr";
import { fetcher } from "../lib/helpers";
import { KVData } from "../types/types";
import Add from "./add";
import EmojiMarquee from "./emoji-marquee";
import Listing from "./listing";
import SignOutButton from "./sign-out-button";

const RouteList = ({ fallback }: { fallback: KVData[] }) => {
  const { data } = useSWR(
    "https://puhack-dot-horse.sparklesrocketeye.workers.dev/api",
    fetcher,
    {
      suspense: true,
      fallbackData: fallback,
    }
  );

  return (
    <div className="flex flex-col">
      <SignOutButton />
      <div className="flex flex-col justify-center items-center">
        <div className="flex flex-col items-center lg:items-start justify-center lg:flex-row gap-8 w-full lg:w-11/12">
          <div className="flex flex-col gap-4 mx-4 max-w-lg">
            <h1 className="text-center text-4xl sm:text-5xl font-bold">
              <span className="select-none inline-block shake">🐴</span>{" "}
              puhack.horse
            </h1>
            <hr className="h-1 border-0 bg-gray-600 rounded-sm" />
            <div className="flex flex-col gap-2">
              <p>
                this is the dashboard for purdue hackers' link shortener.
                welcome!!!
              </p>
              <p>
                to edit something, just click on it in the table. your changes
                will reflect on the dashboard immediately and update in
                cloudflare workers kv in the background. some operations may
                take up to 60 seconds for the dashboard to recongize they've
                updated, but most of the time everything you change should be
                available almost instantly.
              </p>
            </div>
            <div className="flex justify-center">
              <EmojiMarquee large={true} />
            </div>
          </div>
          <EmojiMarquee />
          <div className="rounded-sm border-[3px] border-black w-11/12 sm:max-w-xl tabular-nums shadow-container shadow-gray-900/70 overflow-y-auto mb-8">
            <div className="py-1 flex flex-row bg-gray-200 border-b-[3px] border-b-black">
              <p className="font-bold text-center w-5/12 sm:w-1/3">route</p>
              <p className="flex-1 font-bold text-center pl-2">destination</p>
            </div>
            <div className="flex flex-col overflow-y-scroll max-h-[32rem]">
              {data.map((kv: KVData) => (
                <Listing
                  key={kv.key}
                  route={kv.key}
                  destination={kv.value}
                  fallback={fallback}
                  status={kv.status}
                />
              ))}
            </div>
            <Add fallback={fallback} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteList;
