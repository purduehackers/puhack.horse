import { redirect } from "next/navigation";
import RouteList from "../../components/route-list";
import { server } from "../../lib/helpers";
import { getCurrentUser } from "../../lib/session";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const data = await fetch(`${server}/api/dash`, {
    headers: {
      Authorization: `Bearer ${process.env.HORSE_SECRET}`,
    },
  }).then((r) => r.json());

  if (!user) {
    redirect("/");
  }

  return <RouteList fallback={data} user={user} />;
}
