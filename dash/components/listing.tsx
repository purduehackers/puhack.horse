"use client";

import { CheckSquare, Edit, XSquare } from "lucide-react";
import { useEffect, useState } from "react";
import useSWR from "swr";
import usePrevious from "../hooks/use-previous";
import { delAndPut, put } from "../lib/api";
import {
  deleteObject,
  error,
  fetcher,
  mutateObject,
  truncate,
} from "../lib/helpers";
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
  const { data, mutate } = useSWR(
    "https://puhack-dot-horse.sparklesrocketeye.workers.dev/api",
    fetcher,
    {
      fallbackData: fallback,
    }
  );

  const [edit, setEdit] = useState(false);
  const [whichEdit, setWhichEdit] = useState("DESTINATION");
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
    <div className="flex flex-row h-16 px-4 first:border-t-0 items-center border-t-2 border-black rounded-sm break-all group bg-gray-200">
      <input
        onChange={(e) => setNewRoute(e.target.value)}
        className="text-sm outline-none w-5/12 sm:w-1/3 pr-4 bg-gray-200 border-r-2 border-black h-full"
        value={newRoute}
        autoFocus={whichEdit === "ROUTE"}
      ></input>
      <div className="flex flex-row flex-1 items-center">
        <textarea
          onChange={(e) => setNewDest(e.target.value)}
          className="text-sm outline-none rounded font-mono pl-2 py-2 w-full resize-none bg-gray-200"
          value={newDest}
          autoFocus={whichEdit === "DESTINATION"}
        ></textarea>
        <button
          className="p-1"
          onClick={async () => {
            setEdit(false);
            if (newRoute === route && newDest === destination) return;
            setColor("amber-100");
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
                      `https://puhack-dot-horse.sparklesrocketeye.workers.dev/api/${route}`,
                      `https://puhack-dot-horse.sparklesrocketeye.workers.dev/api/${newRoute}`,
                      newDest,
                      newData
                    )
                  : put(
                      `https://puhack-dot-horse.sparklesrocketeye.workers.dev/api/${newRoute}`,
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
          className="p-1"
          onClick={() => {
            setEdit(false);
            setNewDest(destination);
          }}
        >
          <XSquare size="26px" color="#ef4444" />
        </button>
      </div>
    </div>
  ) : (
    <div
      className={`first:border-t-0 flex flex-row items-center border-t-2 border-black px-4 break-all group ${
        status || color !== "white" ? `hover:bg-${color}` : `hover:bg-gray-200`
      } bg-${color} transition ease-in-out`}
    >
      <p
        className="text-sm truncate pr-4 cursor-pointer border-r-2 border-black py-2 w-5/12 sm:w-1/3"
        onClick={() => {
          setEdit(true);
          setNewRoute(route);
          setNewDest(destination);
          setWhichEdit("ROUTE");
        }}
      >
        {route}
      </p>
      <div className="flex flex-row flex-1 pl-2 max-h-16 items-center">
        <p
          className="font-mono py-2 text-sm text-gray-500 group-hover:text-black cursor-pointer"
          onClick={() => {
            setEdit(true);
            setNewRoute(route);
            setNewDest(destination);
            setWhichEdit("DESTINATION");
          }}
        >
          {truncate(newDest, 28)}
        </p>
        <div
          className="grow cursor-pointer py-4"
          onClick={() => {
            setEdit(true);
            setNewRoute(route);
            setNewDest(destination);
            setWhichEdit("DESTINATION");
          }}
        ></div>
        <button
          className="text-xs p-1 invisible group-hover:visible"
          onClick={() => {
            setEdit(true);
            setNewRoute(route);
            setNewDest(destination);
            setWhichEdit("DESTINATION");
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
