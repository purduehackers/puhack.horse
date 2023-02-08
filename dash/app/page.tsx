import { redirect } from "next/navigation";
import SignInButton from "../components/sign-in-button";
import { getCurrentUser } from "../lib/session";

async function Index() {
  const user = await getCurrentUser();
  if (user) {
    return redirect("/dashboard");
  }
  return (
    <div className="flex h-screen flex-col items-center justify-center py-2 font-main">
      <main className="flex w-full flex-1 flex-col gap-4 items-center justify-center px-4 md:px-20">
        <h1 className="text-amber-600 font-mono text-3xl sm:text-6xl font-bold">
          <span className="select-none inline-block shake">🐴</span>{" "}
          puhack.horse{" "}
          <span className="select-none inline-block shake">🐴</span>
        </h1>
        <div className="border-2 border-black bg-gray-200 p-2 rounded max-w-lg flex flex-col gap-2">
          <p>Hello!!!! You've found the admin dashboard for puhack.horse</p>
          <p>
            You can only access this if you're on the Core team in the Purdue
            hackers GitHub org. If you think you should be in there, but can't
            access the dashboard, ping @matthew!!!
          </p>
        </div>
        <SignInButton />
      </main>
    </div>
  );
}

export default Index;
