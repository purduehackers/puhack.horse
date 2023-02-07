"use client";

import { CheckSquare, Edit, XSquare } from "lucide-react";
import { useEffect, useState } from "react";
import useSWR from "swr";
import usePrevious from "../hooks/use-previous";
import { updateDestination, updateRoute } from "../lib/api";
import {
  deleteObject,
  error,
  fetcher,
  mutateObject,
  server,
} from "../lib/helpers";
import { ConfigData, Status } from "../types/types";
import Erase from "./erase";

const Listing = ({
  route,
  destination,
  visits,
  fallback,
  status,
}: {
  route: string;
  destination: string;
  visits: number;
  fallback: ConfigData[];
  status?: Status;
}) => {
  const { data, mutate } = useSWR(`${server}/api/dash`, fetcher, {
    fallbackData: fallback,
  });

  const [edit, setEdit] = useState(false);
  const [whichEdit, setWhichEdit] = useState("DESTINATION");
  const [newRoute, setNewRoute] = useState(route);
  const [newDest, setNewDest] = useState(destination);
  const [color, setColor] = useState("white");

  const [currentStatus, setCurrentStatus] = useState(status);
  const prevStatus = usePrevious(currentStatus);

  useEffect(() => {
    if (currentStatus === "PENDING" && !prevStatus) {
      setColor("amber-300");
    }
    if (currentStatus === "PENDING" && prevStatus === "PENDING") {
      setColor("green-300");
      setTimeout(() => {
        setColor("white");
        setCurrentStatus("NEUTRAL");
      }, 2000);
    }
    if (currentStatus === "FAIL") {
      setColor("red-300");
      setTimeout(() => {
        setColor("white");
        setCurrentStatus("NEUTRAL");
      }, 2000);
    }
  }, [status]);

  return edit ? (
    <div className="flex flex-row h-16 pl-2 sm:pl-3 pr-1 first:border-t-0 items-center border-t-2 border-black rounded-sm break-all group bg-gray-200">
      <input
        onChange={(e) => setNewRoute(e.target.value)}
        className="text-sm outline-none w-5/12 sm:w-1/4 pr-4 bg-gray-200 border-r-2 border-black h-full"
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
            setColor("amber-300");
            let newData;
            if (route !== newRoute) {
              const filteredData = deleteObject(route, data);
              newData = filteredData
                .concat({
                  route: newRoute,
                  destination: newDest,
                  visits,
                  status: "PENDING",
                })
                .sort((a, b) => a.route.localeCompare(b.route));
            } else {
              newData = mutateObject("destination", data, newRoute, newDest);
            }
            try {
              await mutate(
                route !== newRoute
                  ? updateRoute(route, newRoute, newDest, visits, newData)
                  : updateDestination(newRoute, newDest, visits, newData),
                {
                  optimisticData: [...newData],
                  rollbackOnError: true,
                  revalidate: route !== newRoute,
                  populateCache: true,
                }
              );
              setColor("green-300");
              setTimeout(() => {
                setColor("white");
              }, 1500);
            } catch (err) {
              await mutate(error(data, route), {
                revalidate: true,
                populateCache: true,
              });
              setNewRoute(route);
              setNewDest(destination);
              setEdit(false);

              setColor("red-300");
              setTimeout(() => {
                setColor("white");
              }, 1500);
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
      className={`first:border-t-0 flex flex-row items-center border-t-2 border-black pl-2 sm:pl-3 pr-1 break-all group ${
        status || color !== "white" ? `hover:bg-${color}` : `hover:bg-gray-200`
      } bg-${color} transition duration-100`}
    >
      <p
        className="text-sm truncate pr-4 cursor-pointer border-r-2 border-black py-2 w-5/12 sm:w-1/4"
        onClick={() => {
          setEdit(true);
          setNewRoute(route);
          setNewDest(destination);
          setWhichEdit("ROUTE");
        }}
      >
        {route}
      </p>
      <div className="flex flex-row flex-1 min-w-0 px-2 max-h-16 items-center">
        <p
          className={`font-mono py-2 truncate text-sm text-gray-500 ${
            color === "white" ? "text-gray-500" : "text-black"
          } group-hover:text-black cursor-pointer transition duration-100`}
          onClick={() => {
            setEdit(true);
            setNewRoute(route);
            setNewDest(destination);
            setWhichEdit("DESTINATION");
          }}
        >
          {newDest}
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
      <div className="border-l-2 w-14 border-black py-2 hidden sm:block font-bold">
        <p className="text-sm pl-2">{visits}</p>
      </div>
    </div>
  );
};

export default Listing;
