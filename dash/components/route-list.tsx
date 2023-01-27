"use client";
import { useEffect } from "react";
import useSWR from "swr";
import usePrevious from "../hooks/use-previous";
import { KVData, Status } from "../types/types";
import Add from "./add";
import Listing from "./listing";
import SignOutButton from "./sign-out-button";

const RouteList = ({ fallback }: { fallback: KVData[] }) => {
  const fetcher = (url: string) => fetch(url).then((r) => r.json());
  const { data } = useSWR(
    "https://puhack-dot-horse.sparklesrocketeye.workers.dev",
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
        <div className="rounded border-[3px] border-black max-h-[36rem] overflow-y-scroll w-11/12 sm:max-w-3xl text-xl tabular-nums">
          <div className="p-1 grid grid-cols-2 gap-2 text-center bg-gray-200 border-b-[3px] border-b-black top-0 sticky w-full">
            <p className="font-bold">route</p>
            <p className="font-bold">destination</p>
          </div>
          {data.map((kv: KVData) => (
            <Listing
              key={kv.key}
              route={kv.key}
              destination={kv.value}
              fallback={fallback}
              status={kv.status}
            />
          ))}
          <Add fallback={fallback} />
        </div>
      </div>
    </div>
  );
};

export default RouteList;
