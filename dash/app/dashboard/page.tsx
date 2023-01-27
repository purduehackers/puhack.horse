import { redirect } from "next/navigation";
import RouteList from "../../components/route-list";
import { getCurrentUser } from "../../lib/session";
import { KVData } from "../../types/types";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const data: KVData[] = await fetch(
    "https://puhack-dot-horse.sparklesrocketeye.workers.dev/api"
  ).then((r) => r.json());

  if (!user) {
    redirect("/");
  }

  return <RouteList fallback={data} />;
}
