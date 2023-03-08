"use client";
import { Plus, X } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import useSWR from "swr";
import * as Dialog from "@radix-ui/react-dialog";
import { ConfigData } from "../types/types";
import { add } from "../lib/api";
import { fetcher, server } from "../lib/helpers";

const Add = ({
  open,
  setOpen,
  fallbackData,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  fallbackData: ConfigData;
}) => {
  const { data, mutate } = useSWR<ConfigData>(`${server}/api/dash`, fetcher, {
    suspense: true,
    fallbackData,
  });

  const [route, setRoute] = useState("");
  const [destination, setDestination] = useState("");

  async function handleSubmit() {
    setRoute("");
    setDestination("");
    if (!data) return;
    const newData = data
      .concat({
        route,
        destination,
        visits: 0,
        status: "PENDING",
      })
      .sort((a: ConfigData, b: ConfigData) => a.route.localeCompare(b.route));
    try {
      await mutate(add(route, destination, 0, newData), {
        optimisticData: [...newData],
        rollbackOnError: true,
        revalidate: true,
        populateCache: true,
      });
    } catch (err) {}
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <div className="py-2 pl-2 bg-amber-500 font-bold flex flex-row items-center gap-1 hover:bg-amber-400 transition duration-100 cursor-pointer sticky w-full bottom-0 border-t-[3px] border-black">
          <Plus />
          <p>add</p>
        </div>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-blackA9 data-[state=open]:animate-overlayShow fixed inset-0" />
        <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-sm bg-white border-[3px] border-black p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
          <Dialog.Title className="text-mauve12 m-0 text-[17px] font-bold">
            Add route
          </Dialog.Title>
          <Dialog.Description className="text-mauve11 mt-[10px] mb-5 text-[15px] leading-normal">
            Your changes will appear on the dashboard instantly, but it will
            take a few seconds for them to reflect in Edge Config.
          </Dialog.Description>
          <fieldset className="mb-[15px] flex items-center gap-5">
            <label
              className="text-gray-800 font-bold w-[90px] text-right text-[15px]"
              htmlFor="route"
            >
              Route
            </label>
            <input
              className="text-gray-800 appearance-none shadow-amber-500 focus:shadow-amber-600 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] sm:text-[15px] leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              id="route"
              placeholder="gravity"
              value={route}
              onChange={(e) => setRoute(e.target.value)}
            />
          </fieldset>
          <fieldset className="mb-[15px] flex items-center gap-5">
            <label
              className="text-gray-800 font-bold w-[90px] text-right text-[15px]"
              htmlFor="destination"
            >
              Destination
            </label>
            <input
              className="text-gray-800 appearance-none shadow-amber-500 focus:shadow-amber-600 inline-flex h-[35px] w-full flex-1 items-center justify-center rounded-[4px] px-[10px] sm:text-[15px] leading-none shadow-[0_0_0_1px] outline-none focus:shadow-[0_0_0_2px]"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              id="destination"
              placeholder="https://gravity.simple-physics.org"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </fieldset>
          <div className="mt-[25px] flex justify-end">
            <Dialog.Close asChild>
              <button
                className="bg-green4 text-green11 disabled:bg-mauve4 disabled:text-mauve11 hover:bg-green5 focus:shadow-black inline-flex h-[35px] items-center justify-center rounded-sm border-2 border-black focus:border-[2.5px] shadow-button shadow-gray-800/80 px-[15px] font-medium leading-none focus:outline-none"
                disabled={route === "" || destination === ""}
                onClick={handleSubmit}
              >
                Save changes
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Close asChild>
            <button
              className="text-amber-600 hover:bg-amber-100 focus:shadow-amber-500 absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:shadow-[0_0_0_2px] focus:outline-none"
              aria-label="Close"
            >
              <X />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default Add;
