import { useState } from "react";
import { CheckSquare, PlusSquare, XSquare } from "react-feather";
import { mutate } from "swr";

const Add = () => {
  const [slug, setSlug] = useState("");
  const [destination, setDestination] = useState("");
  const [edit, setEdit] = useState(false);
  return (
    <div
      className="p-1 grid grid-cols-2 gap-2 bg-gray-200 cursor-pointer"
      onClick={() => setEdit(true)}
    >
      {edit ? (
        <div>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="text-sm border-2 p-1 border-gray-500 rounded font-mono w-40"
          ></input>
          <div>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="text-sm border-2 p-1 border-gray-500 rounded font-mono w-40"
            ></input>
            <button
              className="p-1 invisible group-hover:visible"
              onClick={async () => {
                await mutate(
                  fetch(
                    `https://puhack-dot-horse.sparklesrocketeye.workers.dev/${slug}`,
                    {
                      method: "PUT",
                      body: JSON.stringify({ data: destination }),
                    }
                  ),
                  {
                    optimisticData: ["", "destination"],
                    populateCatche: true,
                    rollbackOnError: true,
                  }
                );
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
        <div className="flex flex-row gap-1 items-center justify-center">
          <PlusSquare />
          <p className="font-bold">add</p>
        </div>
      )}
    </div>
  );
};

export default Add;
