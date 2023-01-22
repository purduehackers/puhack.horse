"use client";

import { useState } from "react";

const Listing = ({ k, v }: { k: string; v: string }) => {
  const [keyActive, setKeyActive] = useState(false);
  const [valActive, setValActive] = useState(false);
  return (
    <div className="grid grid-cols-2 gap-2 items-center border-b-2 border-black last:border-b-0 rounded-sm p-2 break-words">
      <p className="text-base text-center">{k}</p>
      <div className="flex flex-row gap-1 items-center">
        <p className="font-mono text-base text-gray-500 hover:text-black">
          {v}
        </p>
        <div className="text-xs p-1 rounded border-[1px] border-black hidden group-hover:block">
          p
        </div>
      </div>
    </div>
  );
};

export default Listing;
