"use client";

import { CheckSquare, Edit, Eraser, XSquare } from "lucide-react";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
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
import { ConfigData, EditItem, Status, User } from "../types/types";
import Erase from "./erase";

const Listing = ({
  user,
  route,
  destination,
  visits,
  fallbackData,
  fetchedBefore,
  status,
  setSignInModalOpen,
}: {
  user: User;
  route: string;
  destination: string;
  visits: number;
  fallbackData: ConfigData[];
  fetchedBefore: boolean;
  status?: Status;
  setSignInModalOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const { data, mutate } = useSWR(`${server}/api/dash`, fetcher, {
    fallbackData,
  });

  const [edit, setEdit] = useState(false);
  const [editItem, setEditItem] = useState<EditItem>("DESTINATION");
  const [newRoute, setNewRoute] = useState(route);
  const [newDest, setNewDest] = useState(destination);
  const [isNewVisit, setIsNewVisit] = useState(false);
  const [color, setColor] = useState("white");

  const [currentStatus, setCurrentStatus] = useState(status);
  const prevStatus = usePrevious(currentStatus);
  const prevRoute = usePrevious(route);
  const prevVisits = usePrevious(visits);

  useEffect(() => {
    if (prevVisits && visits !== prevVisits) {
      setIsNewVisit(true);
      setTimeout(() => {
        setIsNewVisit(false);
      }, 2000);
    }
  }, [visits]);
  useEffect(() => {
    if (!prevRoute && !status && fetchedBefore) {
      setColor("blue-300");
      setTimeout(() => {
        setColor("white");
      }, 2000);
    }
  }, [prevRoute, status]);
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

  async function handleMutate() {
    setEdit(false);
    if (!user) {
      setNewRoute(route);
      setNewDest(destination);
      return setSignInModalOpen(true);
    }
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
  }

  return edit ? (
    <div className="flex flex-row h-16 first:border-t-0 items-center border-t-2 border-black rounded-sm break-all group bg-gray-200">
      <input
        onChange={(e) => setNewRoute(e.target.value)}
        className="text-sm outline-none w-5/12 sm:w-1/4 pl-2 pr-4 pb-5 bg-gray-200 border-r-2 border-black h-full"
        value={newRoute}
        autoFocus={editItem === "ROUTE"}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setEdit(false);
            setNewRoute(route);
            setNewDest(destination);
          } else if (e.key === "Enter") {
            return handleMutate();
          }
        }}
      ></input>
      <div className="flex flex-row flex-1 items-center">
        <textarea
          onChange={(e) => setNewDest(e.target.value)}
          className="text-sm outline-none rounded font-mono p-2 w-full resize-none bg-gray-200"
          value={newDest}
          autoFocus={editItem === "DESTINATION"}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setEdit(false);
              setNewRoute(route);
              setNewDest(destination);
            } else if (e.key === "Enter") {
              return handleMutate();
            }
          }}
        ></textarea>
        <button className="p-1" onClick={handleMutate}>
          <CheckSquare size="26px" color="#22c55e" />
        </button>
        <button
          className="pl-1 mr-4"
          onClick={() => {
            setEdit(false);
            setNewRoute(route);
            setNewDest(destination);
          }}
        >
          <XSquare size="26px" color="#ef4444" />
        </button>
      </div>
    </div>
  ) : (
    <div
      className={`first:border-t-0 flex flex-row items-center border-t-2 border-black break-all group ${
        status || color !== "white" ? `hover:bg-${color}` : `hover:bg-gray-200`
      } bg-${color} transition duration-100`}
    >
      <p
        className="text-sm truncate pr-4 pl-2 cursor-pointer border-r-2 border-black py-2 w-5/12 sm:w-1/4"
        onClick={() => {
          setEdit(true);
          setNewRoute(route);
          setNewDest(destination);
          setEditItem("ROUTE");
        }}
      >
        {route}
      </p>
      <div className="flex flex-row flex-1 min-w-0 max-h-16 items-center">
        <p
          className={`font-mono p-2 truncate text-sm text-gray-500 ${
            color === "white" ? "text-gray-500" : "text-black"
          } group-hover:text-black cursor-pointer transition duration-100`}
          onClick={() => {
            setEdit(true);
            setNewRoute(route);
            setNewDest(destination);
            setEditItem("DESTINATION");
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
            setEditItem("DESTINATION");
          }}
        ></div>
        <button
          className="text-xs py-1 px-2 invisible group-hover:visible"
          onClick={() => {
            setEdit(true);
            setNewRoute(route);
            setNewDest(destination);
            setEditItem("DESTINATION");
          }}
        >
          <Edit size="22px" />
        </button>
        {user ? (
          <Erase fallbackData={fallbackData} route={route} />
        ) : (
          <button
            className="text-xs py-1 mr-3 invisible group-hover:visible"
            onClick={() => setSignInModalOpen(true)}
          >
            <Eraser size="22px" />
          </button>
        )}
      </div>
      <div
        className={`border-l-2 w-20 border-black py-2 hidden sm:block font-bold ${
          isNewVisit && "bg-blue-300"
        } transition duration-100`}
      >
        <p className="text-sm pl-2">{visits}</p>
      </div>
    </div>
  );
};

export default Listing;
