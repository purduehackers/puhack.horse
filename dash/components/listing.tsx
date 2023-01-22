"use client";

import { useState } from "react";
import { CheckSquare, Edit, XSquare } from "react-feather";

const Listing = ({ k, v }: { k: string; v: string }) => {
  const [keyActive, setKeyActive] = useState(false);
  const [valActive, setValActive] = useState(false);
  const [input, setInput] = useState("");
  return (
    <div className="grid grid-cols-2 gap-2 items-center border-b-2 border-black last:border-b-0 rounded-sm p-2 break-words">
      <p className="text-base text-center cursor-pointer">{k}</p>
      {valActive ? (
        <div className="flex flex-row gap-1 items-center group">
          <input
            type="text"
            onChange={(e) => setInput(e.target.value)}
            className="text-sm border-2 p-1 border-gray-500 rounded font-mono w-40"
            value={input}
          ></input>
          <button className="p-1 invisible group-hover:visible">
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
            setInput(v);
          }}
        >
          <p className="font-mono text-base text-gray-500 group-hover:text-black cursor-pointer">
            {truncate(v, 32)}
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
