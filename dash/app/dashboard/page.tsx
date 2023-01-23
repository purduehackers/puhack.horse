import { redirect } from "next/navigation";
import { PlusSquare } from "react-feather";
import Listing from "../../components/listing";
import RouteList from "../../components/route-list";
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

  return <RouteList fallback={data} />;
}
