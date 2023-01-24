"use client";

import { useState } from "react";
import { CheckSquare, Edit, XSquare } from "react-feather";
import { mutate } from "swr";
import { KVData } from "../types/types";

const Listing = ({
  slug,
  destination,
  data,
}: {
  slug: string;
  destination: string;
  data: KVData[];
}) => {
  const [keyActive, setKeyActive] = useState(false);
  const [valActive, setValActive] = useState(false);
  const [key, setKey] = useState(slug);
  const [value, setValue] = useState(destination);
  const [input, setInput] = useState("");
  return (
    <div className="grid grid-cols-2 gap-2 items-center border-b-2 border-black last:border-b-0 rounded-sm p-2 break-all">
      <p className="text-base text-center cursor-pointer">{key}</p>
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
              await mutate(
                fetch(
                  `https://puhack-dot-horse.sparklesrocketeye.workers.dev/${key}`,
                  {
                    method: "PUT",
                    body: JSON.stringify({ data: input }),
                  }
                ),
                {
                  optimisticData: [...data, input],
                  populateCatche: true,
                  rollbackOnError: true,
                }
              );
              setValue(input);
              setValActive(false);
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
        <div
          className="flex flex-row gap-1 items-center group"
          onClick={() => {
            setValActive(true);
            setInput(value);
          }}
        >
          <p className="font-mono text-base text-gray-500 group-hover:text-black cursor-pointer">
            {truncate(value, 32)}
          </p>
          <button className="text-xs p-1 invisible group-hover:visible">
            <Edit size="22px" />
          </button>
        </div>
      )}
    </div>
  );
};

function truncate(str: string, num: number) {
  if (str.length > num) {
    return str.slice(0, num) + "...";
  } else {
    return str;
  }
}

export default Listing;
