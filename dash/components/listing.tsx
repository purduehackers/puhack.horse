"use client";

import {
  Check,
  CheckSquare,
  Edit,
  Eraser,
  XSquare,
  ExternalLink,
  Copy,
} from "lucide-react";
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
  sort,
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
  setInfoModalOpen,
  setSelectedData,
}: {
  user: User;
  route: string;
  destination: string;
  visits: number;
  fallbackData: ConfigData;
  fetchedBefore: boolean;
  status?: Status;
  setSignInModalOpen: Dispatch<SetStateAction<boolean>>;
  setInfoModalOpen: Dispatch<SetStateAction<boolean>>;
  setSelectedData: Dispatch<
    SetStateAction<{ route: string; destination: string }>
  >;
}) => {
  const { data, mutate } = useSWR<ConfigData>(`${server}/api/dash`, fetcher, {
    fallbackData,
  });

  const [edit, setEdit] = useState(false);
  const [editItem, setEditItem] = useState<EditItem>("DESTINATION");
  const [newRoute, setNewRoute] = useState(route);
  const [newDest, setNewDest] = useState(destination);
  const [isNewVisit, setIsNewVisit] = useState(false);
  const [color, setColor] = useState("white");
  const [copied, setCopied] = useState(false);

  const [currentStatus, setCurrentStatus] = useState(status);
  const prevStatus = usePrevious(currentStatus);
  const prevRoute = usePrevious(route);
  const prevVisits = usePrevious(visits);

  function handleEditField(
    user: User,
    editItem: "ROUTE" | "DESTINATION",
    modal: "INFO" | "SIGN_IN"
  ) {
    if (user) {
      setEdit(true);
      setNewRoute(route);
      setNewDest(destination);
      setEditItem(editItem);
    } else {
      setSelectedData({
        route,
        destination,
      });
      if (modal === "INFO") {
        setInfoModalOpen(true);
      } else {
        setSignInModalOpen(true);
      }
    }
  }

  function copyDestinationToClipboard() {
    navigator.clipboard
      .writeText(destination)
      .then(() => setCopied(true))
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  }

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
  useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 1000);
    }
  }, [copied]);

  async function handleMutate() {
    if (!data) return;
    setEdit(false);
    if (newRoute === route && newDest === destination) return;
    if (!user) {
      setNewRoute(route);
      setNewDest(destination);
      return setSignInModalOpen(true);
    }

    setColor("amber-300");
    let newData: ConfigData = data;
    if (route !== newRoute) {
      newData = deleteObject(route, data);
      newData[newRoute] = {
        d: newDest,
        v: visits,
        status: "PENDING",
      };
      newData = sort(newData);
    } else {
      newData = mutateObject("destination", data, newRoute, newDest);
    }
    try {
      await mutate(
        route !== newRoute
          ? updateRoute(route, newRoute, newDest, visits, newData)
          : updateDestination(newRoute, newDest, visits, newData),
        {
          optimisticData: newData,
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
        onClick={() => handleEditField(user, "ROUTE", "INFO")}
      >
        {route}
      </p>
      <div className="flex flex-row flex-1 min-w-0 max-h-16 items-center">
        <p
          className={`font-mono p-2 truncate text-sm text-gray-500 ${
            color === "white" ? "text-gray-500" : "text-black"
          } group-hover:text-black cursor-pointer transition duration-100`}
          onClick={() => handleEditField(user, "DESTINATION", "INFO")}
        >
          {newDest}
        </p>
        <div
          className="grow cursor-pointer py-4"
          onClick={() => handleEditField(user, "DESTINATION", "INFO")}
        ></div>
        <button
          className="py-1 pr-2 hidden group-hover:block"
          onClick={() => handleEditField(user, "DESTINATION", "SIGN_IN")}
        >
          <Edit size="22px" />
        </button>
        {user ? (
          <Erase fallbackData={fallbackData} route={route} />
        ) : (
          <button
            className="py-1 pr-2 hidden group-hover:block"
            onClick={() => setSignInModalOpen(true)}
          >
            <Eraser size="22px" />
          </button>
        )}
        <button
          className="py-1 pr-2 hidden group-hover:block"
          onClick={() => copyDestinationToClipboard()}
        >
          {copied ? <Check size="22px" /> : <Copy size="22px" />}
        </button>
      </div>
      <a
        href={newDest}
        target="_blank"
        className="py-1 mr-2 hidden group-hover:block"
      >
        <ExternalLink size="23px" />
      </a>
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
