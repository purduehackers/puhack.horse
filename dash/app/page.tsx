import { redirect } from "next/navigation";
import EmojiMarquee from "../components/emoji-marquee";
import RouteList from "../components/route-list";
import UserInfo from "../components/user/user-info";
import { server } from "../lib/helpers";
import { getCurrentUser } from "../lib/session";

export default async function Index() {
  const user = await getCurrentUser();
  const data = await fetch(`${server}/api/dash`, {
    headers: {
      Authorization: `Bearer ${process.env.HORSE_SECRET}`,
    },
  }).then((r) => r.json());

  return (
    <div className="flex flex-col">
      <UserInfo user={user} />
      <div className="flex flex-col justify-center items-center">
        <div className="flex flex-col items-center lg:items-start justify-center lg:flex-row w-full lg:w-11/12 xl:w-full gap-x-8">
          <div className="flex flex-col gap-4 mx-4 max-w-sm">
            <h1 className="text-center text-amber-600 font-mono text-3xl sm:text-4xl font-bold">
              <span className="select-none inline-block shake">🐴</span>{" "}
              puhack.horse{" "}
              <span className="select-none inline-block shake">🐴</span>
            </h1>
            <hr className="h-1 border-0 bg-gray-600 rounded-sm" />
            <div className="flex flex-col gap-2">
              <p>
                this is the dashboard for purdue hackers' link shortener.
                welcome!!!
              </p>
              <p>
                to edit something, just click on it in the table. your changes
                will reflect on the dashboard immediately and update in edge
                config in the background. it will take a few seconds to
                propagate, but shouldn't take longer than that.
              </p>
            </div>
            <div className="flex justify-center">
              <EmojiMarquee large={true} />
            </div>
          </div>
          <EmojiMarquee />
          <RouteList fallbackData={data} user={user} />
        </div>
      </div>
    </div>
  );
}
