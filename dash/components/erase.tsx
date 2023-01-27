import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Eraser } from "lucide-react";
import useSWR from "swr";
import { del } from "../lib/api";
import { KVData } from "../types/types";

const Erase = ({ fallback, route }: { fallback: KVData[]; route: string }) => {
  const fetcher = (url: string) => fetch(url).then((r) => r.json());
  const { data, mutate } = useSWR(
    "https://puhack-dot-horse.sparklesrocketeye.workers.dev/api",
    fetcher,
    {
      fallbackData: fallback,
    }
  );
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        <button className="text-xs p-1 invisible group-hover:visible">
          <Eraser size="22px" />
        </button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="AlertDialogOverlay" />
        <AlertDialog.Content className="AlertDialogContent">
          <AlertDialog.Description className="AlertDialogDescription">
            Are you sure you want to delete this route?
          </AlertDialog.Description>
          <div style={{ display: "flex", gap: 25, justifyContent: "flex-end" }}>
            <AlertDialog.Cancel asChild>
              <button className="Button mauve">Cancel</button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                className="Button red"
                onClick={async () => {
                  const newData = deleteObject(route, data);
                  try {
                    await mutate(
                      del(
                        `https://puhack-dot-horse.sparklesrocketeye.workers.dev/api/${route}`,
                        newData
                      ),
                      {
                        optimisticData: [...newData],
                        rollbackOnError: true,
                        revalidate: false,
                        populateCache: true,
                      }
                    );
                  } catch (err) {}
                }}
              >
                Delete route
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};

function deleteObject(route: string, data: KVData[]) {
  return data.filter((el) => el.key !== route);
}

export default Erase;
