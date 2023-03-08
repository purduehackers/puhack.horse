import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Eraser } from "lucide-react";
import useSWR from "swr";
import { del } from "../lib/api";
import { fetcher, server } from "../lib/helpers";
import { ConfigData } from "../types/types";

const Erase = ({
  fallbackData,
  route,
}: {
  fallbackData: ConfigData[];
  route: string;
}) => {
  const { data, mutate } = useSWR(`${server}/api/dash`, fetcher, {
    fallbackData,
  });
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        <button className="text-xs py-1 pr-2 hidden group-hover:block">
          <Eraser size="22px" />
        </button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="bg-blackA9 data-[state=open]:animate-overlayShow fixed inset-0" />
        <AlertDialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[500px] translate-x-[-50%] translate-y-[-50%] rounded-sm border-[3px] border-black bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
          <AlertDialog.Title className="text-mauve12 m-0 text-[17px] font-medium">
            Delete route
          </AlertDialog.Title>
          <AlertDialog.Description className="text-mauve11 mt-4 mb-5 text-[15px] leading-normal">
            Are you sure you want to delete the route{" "}
            {<span className="font-bold text-gray-700">{route}</span>}?
          </AlertDialog.Description>
          <div className="flex justify-end gap-[25px]">
            <AlertDialog.Cancel asChild>
              <button className="text-mauve11 bg-mauve4 hover:bg-mauve5 focus:shadow-black inline-flex h-[35px] items-center justify-center rounded-sm border-2 border-black shadow-button shadow-gray-800/80 px-[15px] font-medium leading-none outline-none focus:border-[2.75px]">
                Cancel
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                className="text-red11 bg-red4 hover:bg-red5 focus:shadow-black inline-flex h-[35px] items-center justify-center rounded-sm border-2 border-black shadow-button shadow-gray-800/80 px-[15px] font-medium leading-none outline-none focus:border-[2.75px]"
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

function deleteObject(route: string, data: ConfigData[]) {
  return data.filter((el) => el.route !== route);
}

export default Erase;
