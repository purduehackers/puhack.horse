"use client";
import { PlusIcon, X } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";
import * as Dialog from "@radix-ui/react-dialog";
import { ConfigData } from "../types/types";
import { add } from "../lib/api";
import { fetcher, server } from "../lib/helpers";

const Add = ({ fallback }: { fallback: ConfigData[] }) => {
  const { data, mutate } = useSWR(`${server}/api/dash`, fetcher, {
    suspense: true,
    fallbackData: fallback,
  });

  const [route, setRoute] = useState("");
  const [destination, setDestination] = useState("");

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <div
          className="py-2 pl-2 bg-amber-500 font-bold flex flex-row items-center gap-1 hover:bg-amber-400 transition duration-100 cursor-pointer sticky w-full bottom-0 border-t-[3px] border-black"
          onClick={() => {}}
        >
          <PlusIcon />
          <p>add</p>
        </div>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="DialogOverlay" />
        <Dialog.Content className="DialogContent">
          <Dialog.Title className="DialogTitle">Add route</Dialog.Title>
          <Dialog.Description className="DialogDescription">
            Your changes will appear on the dashboard instantly, but it may take
            up to 60 seconds for them to reflect in KV.
          </Dialog.Description>
          <fieldset className="Fieldset">
            <label className="Label" htmlFor="route">
              Route
            </label>
            <input
              className="Input"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              id="route"
              value={route}
              onChange={(e) => setRoute(e.target.value)}
            />
          </fieldset>
          <fieldset className="Fieldset">
            <label className="Label" htmlFor="destination">
              Destination
            </label>
            <input
              className="Input"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
            />
          </fieldset>
          <div
            style={{
              display: "flex",
              marginTop: 25,
              justifyContent: "flex-end",
            }}
          >
            <Dialog.Close asChild>
              <button
                className="Button green"
                disabled={route === "" || destination === ""}
                onClick={async () => {
                  setRoute("");
                  setDestination("");
                  const newData = data
                    .concat({
                      route: route,
                      destination: destination,
                      visits: 0,
                      status: "PENDING",
                    })
                    .sort((a: ConfigData, b: ConfigData) =>
                      a.route.localeCompare(b.route)
                    );
                  try {
                    await mutate(add(route, destination, 0, newData), {
                      optimisticData: [...newData],
                      rollbackOnError: true,
                      revalidate: true,
                      populateCache: true,
                    });
                  } catch (err) {}
                }}
              >
                Save changes
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Close asChild>
            <button className="IconButton" aria-label="Close">
              <X />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default Add;
