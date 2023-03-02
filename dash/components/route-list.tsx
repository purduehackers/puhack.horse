"use client";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { fetcher, server } from "../lib/helpers";
import { ConfigData, User } from "../types/types";
import Add from "./add";
import EmojiMarquee from "./emoji-marquee";
import Listing from "./listing";
import UserInfo from "./user-info";

const RouteList = () => {
  const fallbackData = [
    {
      route: "loading...",
      destination: "loading...",
      visits: 0,
    },
  ];
  const { data } = useSWR(`${server}/api/dash`, fetcher, {
    suspense: true,
    fallbackData,
  });

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
    <>
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
    </>
  );
};

export default RouteList;
