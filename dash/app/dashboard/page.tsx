import { redirect } from "next/navigation";
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
        <div className="rounded border-2 border-black max-h-96 overflow-y-scroll w-11/12 sm:max-w-sm tabular-nums">
          <div className="p-1 grid grid-cols-2 gap-2 text-center bg-gray-200">
            <p className="font-bold">key</p>
            <p className="font-bold">value</p>
          </div>
          {data.map((kv: Data) => (
            <div
              key={kv.key}
              className="grid grid-cols-2 gap-2 text-center border-2 border-white hover:border-gray-400 rounded-sm"
            >
              <p>{kv.key}</p>
              <p>{kv.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
