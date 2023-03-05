"use client";
import { X } from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { signIn } from "next-auth/react";

const Add = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="bg-blackA9 data-[state=open]:animate-overlayShow fixed inset-0 backdrop-blur-sm" />
        <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-sm bg-white border-[3px] border-black p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
          <Dialog.Title className="text-mauve12 m-0 text-[17px] font-bold">
            Sign In
          </Dialog.Title>
          <Dialog.Description className="text-mauve11 mt-[10px] mb-5 text-[15px] leading-normal">
            In order to edit the data, you need to sign in.
          </Dialog.Description>
          <div className="mt-[25px] flex justify-center">
            <Dialog.Close asChild>
              <button
                className="bg-amber4 text-amber11 disabled:bg-mauve4 disabled:text-mauve11 hover:bg-amber5 focus:shadow-black inline-flex h-[35px] items-center justify-center rounded-sm border-2 border-black focus:border-[2.5px] shadow-button shadow-gray-800/80 px-[15px] font-medium leading-none focus:outline-none"
                onClick={() => signIn("github")}
              >
                Sign In
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
