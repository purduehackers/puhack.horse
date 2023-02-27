// Next.js won't build this project unless I include at least one page.
// This page will never be seen; `middleware.ts` will always redirect
// the user to either the intended destination or purduehackers.com

const Page = () => (
  <a href="https://mastodon.boiler.social/@purduehackers" rel="me"></a>
);
export default Page;
