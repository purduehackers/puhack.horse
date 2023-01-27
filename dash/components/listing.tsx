"use client";

import { CheckSquare, Edit, XSquare } from "lucide-react";
import { useEffect, useState } from "react";
import useSWR from "swr";
import usePrevious from "../hooks/use-previous";
import { delAndPut, put } from "../lib/api";
import { deleteObject, error, mutateObject, truncate } from "../lib/helpers";
import { KVData, Status } from "../types/types";
import Erase from "./erase";

const Listing = ({
  route,
  destination,
  fallback,
  status,
}: {
  route: string;
  destination: string;
  fallback: KVData[];
  status?: Status;
}) => {
  const fetcher = (url: string) => fetch(url).then((r) => r.json());
  const { data, mutate } = useSWR(
    "https://puhack-dot-horse.sparklesrocketeye.workers.dev",
    fetcher,
    {
      fallbackData: fallback,
    }
  );

  const [edit, setEdit] = useState(false);
  const [newRoute, setNewRoute] = useState(route);
  const [newDest, setNewDest] = useState(destination);
  const [color, setColor] = useState("white");

  const [currentStatus, setCurrentStatus] = useState(status);
  const prevStatus = usePrevious(currentStatus);

  useEffect(() => {
    if (currentStatus === "PENDING" && !prevStatus) {
      setColor("amber-100");
    }
    if (currentStatus === "PENDING" && prevStatus === "PENDING") {
      setColor("green-100");
      setTimeout(() => {
        setColor("white-100");
        setCurrentStatus("NEUTRAL");
      }, 2000);
    }
    if (currentStatus === "FAIL") {
      setColor("red-100");
      setTimeout(() => {
        setColor("white-100");
        setCurrentStatus("NEUTRAL");
      }, 2000);
    }
  }, [status]);

  return edit ? (
    <div className="grid grid-cols-2 gap-2 items-center border-t-2 border-black rounded-sm p-2 break-all group bg-gray-200">
      <div className="flex flex-row justify-center">
        <input
          onChange={(e) => setNewRoute(e.target.value)}
          className="text-sm border-2 p-1 outline-none border-gray-500 rounded font-mono w-7/12 bg-white text-center"
          value={newRoute}
          autoFocus
        ></input>
      </div>
      <div className="flex flex-row gap-1 items-center">
        <textarea
          onChange={(e) => setNewDest(e.target.value)}
          className="text-sm border-2 p-1 outline-none border-gray-500 rounded font-mono w-full bg-white resize-none"
          value={newDest}
          autoFocus
        ></textarea>
        <button
          className="p-1 invisible group-hover:visible"
          onClick={async () => {
            setEdit(false);
            setColor("amber-100");
            if (newRoute === route && newDest === destination) return;
            let newData;
            if (route !== newRoute) {
              const filteredData = deleteObject(route, data);
              newData = filteredData
                .concat({ key: newRoute, value: newDest, status: "PENDING" })
                .sort((a, b) => a.key.localeCompare(b.key));
            } else {
              newData = mutateObject("value", data, newRoute, newDest);
            }
            try {
              await mutate(
                route !== newRoute
                  ? delAndPut(
                      `https://puhack-dot-horse.sparklesrocketeye.workers.dev/${route}`,
                      `https://puhack-dot-horse.sparklesrocketeye.workers.dev/${newRoute}`,
                      newDest,
                      newData
                    )
                  : put(
                      `https://puhack-dot-horse.sparklesrocketeye.workers.dev/${newRoute}`,
                      newDest,
                      newData
                    ),
                {
                  optimisticData: [...newData],
                  rollbackOnError: true,
                  revalidate: route !== newRoute,
                  populateCache: true,
                }
              );
              setColor("green-100");
              setTimeout(() => {
                setColor("white");
              }, 1000);
            } catch (err) {
              await mutate(error(data, route), {
                revalidate: true,
                populateCache: true,
              });
              setNewRoute(route);
              setNewDest(destination);
              setEdit(false);

              setColor("red-100");
              setTimeout(() => {
                setColor("white");
              }, 1000);
            }
          }}
        >
          <CheckSquare size="26px" color="#22c55e" />
        </button>
        <button
          className="p-1 invisible group-hover:visible"
          onClick={() => setEdit(false)}
        >
          <XSquare size="26px" color="#ef4444" />
        </button>
      </div>
    </div>
  ) : (
    <div
      className={`route-list-item grid grid-cols-2 gap-2 items-center border-t-2 border-black p-2 break-all group ${
        color === "white" ? `hover:bg-gray-200` : `hover:bg-${color}`
      } bg-${color} transition ease-in-out`}
    >
      <p
        className="text-base text-center cursor-pointer"
        onClick={() => {
          setEdit(true);
          setNewRoute(route);
          setNewDest(destination);
        }}
      >
        {route}
      </p>
      <div className="flex flex-row gap-1 items-center">
        <p
          className="font-mono text-base text-gray-500 group-hover:text-black cursor-pointer"
          onClick={() => {
            setEdit(true);
            setNewRoute(route);
            setNewDest(destination);
          }}
        >
          {truncate(newDest, 32)}
        </p>
        <button
          className="text-xs p-1 invisible group-hover:visible"
          onClick={() => {
            setEdit(true);
            setNewRoute(route);
            setNewDest(destination);
          }}
        >
          <Edit size="22px" />
        </button>
        <Erase fallback={fallback} route={route} />
      </div>
    </div>
  );
};

export default Listing;
