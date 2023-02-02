"use client";
import useSWR from "swr";
import { fetcher } from "../lib/helpers";
import { KVData } from "../types/types";
import Add from "./add";
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
    <div className="min-h-screen flex flex-col">
      <SignOutButton />
      <div className="flex flex-col grow justify-center items-center">
        <div className="rounded border-[3px] border-black w-11/12 sm:max-w-xl tabular-nums">
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
  );
};

export default RouteList;
