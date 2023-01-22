import { redirect } from "next/navigation";
import Listing from "../../components/listing";
import SignOutButton from "../../components/sign-out-button";
import { getCurrentUser } from "../../lib/session";

type Data = {
  key: string;
  value: string;
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const data = await fetch(
    "https://puhack-dot-horse.sparklesrocketeye.workers.dev"
  ).then((r) => r.json());

  if (!user) {
    redirect("/");
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SignOutButton />
      <div className="flex flex-col grow justify-center items-center">
        <div className="rounded border-[3px] border-black max-h-96 overflow-y-scroll w-11/12 sm:max-w-lg text-xl tabular-nums">
          <div className="p-1 grid grid-cols-2 gap-2 text-center bg-gray-200 border-b-[3px] border-b-black">
            <p className="font-bold">slug</p>
            <p className="font-bold">destination</p>
          </div>
          {data.map((kv: Data) => (
            <Listing key={kv.key} k={kv.key} v={kv.value} />
          ))}
        </div>
      </div>
    </div>
  );
}
