"use client";

import { CheckSquare, Edit, XSquare } from "lucide-react";
import { useState } from "react";
import useSWRImmutable from "swr/immutable";
import { del, delAndPut, put } from "../lib/api";
import { deleteObject, mutateObject, truncate } from "../lib/helpers";
import { KVData } from "../types/types";
import Erase from "./erase";

const Listing2 = ({
  route,
  destination,
  fallback,
}: {
  route: string;
  destination: string;
  fallback: KVData[];
}) => {
  const fetcher = (url: string) => fetch(url).then((r) => r.json());
  const { data, mutate } = useSWRImmutable(
    "https://puhack-dot-horse.sparklesrocketeye.workers.dev",
    fetcher,
    {
      fallbackData: fallback,
    }
  );

  const [edit, setEdit] = useState(false);
  const [newRoute, setNewRoute] = useState(route);
  const [newDest, setNewDest] = useState(destination);

  return edit ? (
    <div className="grid grid-cols-2 gap-2 items-center border-b-2 border-black last:border-b-0 rounded-sm p-2 break-all group">
      <textarea
        onChange={(e) => setNewRoute(e.target.value)}
        className="text-sm border-2 p-1 border-gray-500 rounded font-mono w-full resize-none"
        value={newRoute}
        autoFocus
      ></textarea>
      <div className="flex flex-row gap-1 items-center">
        <textarea
          onChange={(e) => setNewDest(e.target.value)}
          className="text-sm border-2 p-1 border-gray-500 rounded font-mono w-full resize-none"
          value={newDest}
          autoFocus
        ></textarea>
        <button
          className="p-1 invisible group-hover:visible"
          onClick={async () => {
            setEdit(false);
            if (newRoute === route && newDest === destination) return;
            let newData;
            if (route !== newRoute) {
              const filteredData = deleteObject(route, data);
              newData = filteredData
                .concat({ key: newRoute, value: newDest })
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
                      newDest
                    )
                  : put(
                      `https://puhack-dot-horse.sparklesrocketeye.workers.dev/${newRoute}`,
                      newDest
                    ),
                {
                  optimisticData: [...newData],
                  rollbackOnError: true,
                  revalidate: false,
                  populateCache: true,
                }
              );
            } catch (err) {
              setNewRoute(route);
              setNewDest(destination);
              setEdit(false);
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
      className="grid grid-cols-2 gap-2 items-center border-b-2 border-black last:border-b-0 rounded-sm p-2 break-all group"
      onClick={() => {
        setEdit(true);
        setNewRoute(route);
        setNewDest(destination);
      }}
    >
      <p className="text-base text-center cursor-pointer">{route}</p>
      <div className="flex flex-row gap-1 items-center">
        <p className="font-mono text-base text-gray-500 group-hover:text-black cursor-pointer">
          {truncate(destination, 32)}
        </p>
        <button className="text-xs p-1 invisible group-hover:visible">
          <Edit size="22px" />
        </button>
        <Erase fallback={fallback} route={route} />
      </div>
    </div>
  );
};

export default Listing2;
