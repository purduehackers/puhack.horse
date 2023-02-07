import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Eraser } from "lucide-react";
import useSWR from "swr";
import { del } from "../lib/api";
import { fetcher } from "../lib/helpers";
import { KVData } from "../types/types";

const Erase = ({ fallback, route }: { fallback: KVData[]; route: string }) => {
  const { data, mutate } = useSWR("http://localhost:3000/api/dash", fetcher, {
    fallbackData: fallback,
  });
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
                    await mutate(del(route, newData), {
                      optimisticData: [...newData],
                      rollbackOnError: true,
                      revalidate: false,
                      populateCache: true,
                    });
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
  return data.filter((el) => el.route !== route);
}

export default Erase;
