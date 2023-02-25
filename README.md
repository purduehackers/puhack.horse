# puhack.horse

🔗🐴 A link shortener powered by Vercel Edge Config.

This is a monorepo with two repositories:

- [dash](https://github.com/purduehackers/puhack.horse/tree/main/dash)
  - An admin dashboard with an optimistic UI
- [horse](https://github.com/purduehackers/puhack.horse/tree/main/horse)
  - Middleware that handles redirecting
  
## Story

A little while back we made [the original puhack.horse](https://github.com/purduehackers/puhack.horse-airtable), which used Airtable as a source of truth. This worked great for us, but we thought it could be even faster if it didn't have to leave the Edge to get its data.

The speed benefits are noticeable but not significant enough to matter much for the average user; it wouldn't be worth it unless it's just as easy to manage the data as it is on Airtable. The `dash` repo is an admin dashboard that attempts to do that by using the [SWR Mutation API](https://swr.vercel.app/docs/mutation).

---

Note: Edge Config is great but not really meant to be used for a serious link shortener. The free plan only allows for 8KB of data; with 34 routes, we're already over 4KB. Plan accordingly!
