import { User } from "next-auth";
import { redirect } from "next/navigation";
import RouteList from "../../components/route-list";
import { getCurrentUser } from "../../lib/session";
import { KVData } from "../../types/types";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const data = await fetch("http://localhost:3000/api/get-all", {
    headers: {
      Authorization: `Bearer ${process.env.HORSE_SECRET}`,
    },
  }).then((r) => r.json());

  if (!user) {
    redirect("/");
  }

  return <RouteList fallback={data} user={user} />;
}
