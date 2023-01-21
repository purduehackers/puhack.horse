import { redirect } from "next/navigation";
import SignOutButton from "../../components/sign-out-button";
import { getCurrentUser } from "../../lib/session";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  return (
    <div>
      <p>name: {user.name}</p>
      <p>email: {user.email}</p>
      <p>image: {user.image}</p>
      <SignOutButton />
    </div>
  );
}
