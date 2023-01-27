"use client";
import { PlusCircle, X } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";
import * as Dialog from "@radix-ui/react-dialog";
import { KVData } from "../types/types";
import { put } from "../lib/api";

const Add = ({ fallback }: { fallback: KVData[] }) => {
  const fetcher = (url: string) => fetch(url).then((r) => r.json());
  const { data, mutate } = useSWR(
    "https://puhack-dot-horse.sparklesrocketeye.workers.dev",
    fetcher,
    {
      suspense: true,
      fallbackData: fallback,
    }
  );

  const [route, setRoute] = useState("");
  const [destination, setDestination] = useState("");

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <div
          className="py-2 bg-gray-200 font-bold flex flex-row justify-center items-center gap-1 hover:bg-gray-300 cursor-pointer"
          onClick={() => {}}
        >
          <PlusCircle />
          <p>add</p>
        </div>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="DialogOverlay" />
        <Dialog.Content className="DialogContent">
          <Dialog.Title className="DialogTitle">Add route</Dialog.Title>
          <Dialog.Description className="DialogDescription">
            Note that it may take up to 60 seconds for your changes to reflect.
          </Dialog.Description>
          <fieldset className="Fieldset">
            <label className="Label" htmlFor="route">
              Route
            </label>
            <input
              className="Input"
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
                onClick={async () => {
                  setRoute("");
                  setDestination("");
                  try {
                    await mutate(
                      put(
                        `https://puhack-dot-horse.sparklesrocketeye.workers.dev/${route}`,
                        destination,
                        data
                      ),
                      {
                        optimisticData: [...data],
                        rollbackOnError: true,
                        revalidate: true,
                        populateCache: true,
                      }
                    );
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
