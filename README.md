# puhack.horse

🔗🐴 A link shortener powered by [Vercel Edge Config](https://vercel.com/blog/edge-config-ultra-low-latency-data-at-the-edge).

This is a monorepo with two repositories:

- [dash](https://github.com/purduehackers/puhack.horse/tree/main/dash)
  - An admin dashboard with an optimistic UI
- [horse](https://github.com/purduehackers/puhack.horse/tree/main/horse)
  - Middleware that handles redirecting
  
## Story

A little while back we made [the original puhack.horse](https://github.com/purduehackers/puhack.horse-airtable), which used Airtable as a source of truth. This worked great for us, but we thought it could be even faster if it didn't have to leave the Edge to get its data.

The speed benefits are noticeable but not significant enough to matter much for the average user; it wouldn't be worth it unless it's just as easy to manage the data as it is on Airtable. The `dash` repo is an admin dashboard that attempts to do that by using the [SWR Mutation API](https://swr.vercel.app/docs/mutation).

<img width="1522" alt="Screenshot 2023-02-25 at 3 22 12 AM" src="https://user-images.githubusercontent.com/14811170/221347293-5df14229-bbd9-4fe9-b56a-f4ed60439922.png">

## Deploy

- Create a GitHub OAuth app (Settings –> Developer Settings). Set the callback URL to `YOUR_DOMAIN/api/auth/callback/github`
- Create an Edge Config Store on your Vercel Dashboard.
- Clone this repo.
- In `dash/lib/auth.ts`, comment out the line with `isInOrg()` at the bottom, or replace it with your own function. This is used to restrict signup to a group of people (in our case, we only want people in our GitHub org to manage routes)
- Deploy the project to Vercel. You'll have to create two projects: one for the `horse` folder and one for the `dash` folder.
- Set the following environment variables in the `dash` project:
  - `NEXT_PUBLIC_HORSE_SECRET`
  - `EDGE_CONFIG_ID`
  - `TEAM_ID`
  - `VERCEL_API_TOKEN`
  - `GITHUB_CLIENT_SECRET`
  - `GITHUB_CLIENT_ID`
  - `NEXTAUTH_URL`
  - `NEXTAUTH_SECRET`
  - `GH_ACCESS_TOKEN`
- Set the following environment variable in the `horse` project:
  - `HORSE_SECRET`
- Connect the Edge Config Store you created to both projects in their "Edge Config" settings tabs.
- profit!

---

Note: Edge Config is great but not really meant to be used for a serious link shortener. The free plan only allows for 8KB of data, which you'll use up after ~100 routes.
