"use client";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import useSWR from "swr";
import { KVData } from "../types/types";

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

  const [edit, setEdit] = useState(false);

  return (
    <div
      className="py-2 bg-gray-200 font-bold flex flex-row justify-center items-center gap-1 hover:bg-gray-300 cursor-pointer"
      onClick={() => {}}
    >
      <PlusCircle />
      <p>add</p>
    </div>
  );
};

export default Add;
