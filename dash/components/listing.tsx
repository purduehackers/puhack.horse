"use client";

import { useState } from "react";
import { CheckSquare, Edit, Eraser, XSquare } from "lucide-react";
import useSWR from "swr";
import { KVData } from "../types/types";
import Erase from "./erase";
import { put } from "../lib/api";

const Listing = ({
  route,
  destination,
  fallback,
}: {
  route: string;
  destination: string;
  fallback: KVData[];
}) => {
  const [valActive, setValActive] = useState(false);
  const [value, setValue] = useState(destination);
  const [input, setInput] = useState("");

  const fetcher = (url: string) => fetch(url).then((r) => r.json());
  const { data, mutate } = useSWR(
    "https://puhack-dot-horse.sparklesrocketeye.workers.dev",
    fetcher,
    {
      fallbackData: fallback,
    }
  );
  return (
    <div className="grid grid-cols-2 gap-2 items-center border-b-2 border-black last:border-b-0 rounded-sm p-2 break-all">
      <p className="text-base text-center cursor-pointer">{route}</p>
      {valActive ? (
        <div className="flex flex-row gap-1 items-center group">
          <input
            type="text"
            onChange={(e) => setInput(e.target.value)}
            className="text-sm border-2 p-1 border-gray-500 rounded font-mono w-40"
            value={input}
            autoFocus
          ></input>
          <button
            className="p-1 invisible group-hover:visible"
            onClick={async () => {
              setValue(input);
              setValActive(false);
              if (input === destination) return;
              const newData = mutateObject("value", data, route, input);
              try {
                await mutate(
                  put(
                    `https://puhack-dot-horse.sparklesrocketeye.workers.dev/${route}`,
                    input
                  ),
                  {
                    optimisticData: [...newData],
                    rollbackOnError: true,
                    revalidate: true,
                    populateCache: true,
                  }
                );
              } catch (err) {
                setValue(destination);
                setValActive(false);
              }
            }}
          >
            <CheckSquare size="26px" color="#22c55e" />
          </button>
          <button
            className="p-1 invisible group-hover:visible"
            onClick={() => setValActive(false)}
          >
            <XSquare size="26px" color="#ef4444" />
          </button>
        </div>
      ) : (
        <div className="flex flex-row gap-1 items-center group">
          <p
            className="font-mono text-base text-gray-500 group-hover:text-black cursor-pointer"
            onClick={() => {
              setValActive(true);
              setInput(value);
            }}
          >
            {truncate(value, 32)}
          </p>
          <button
            className="text-xs p-1 invisible group-hover:visible"
            onClick={() => {
              setValActive(true);
              setInput(value);
            }}
          >
            <Edit size="22px" />
          </button>
          <Erase fallback={fallback} route={route} />
        </div>
      )}
    </div>
  );
};

function mutateObject(
  toChange: string,
  data: KVData[],
  key: string,
  value: string
) {
  if (toChange === "value") {
    const el = data.find((el) => el.key === key);
    if (el) {
      el.value = value;
    }
  }
  return data;
}

function truncate(str: string, num: number) {
  if (str.length > num) {
    return str.slice(0, num) + "...";
  } else {
    return str;
  }
}

export default Listing;
