import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: "https://ba53f87298085e2e623f6ac2bdb79218@o4510744753405952.ingest.us.sentry.io/4511385602555904",
  tracesSampleRate: 1,
  enableLogs: true,
  sendDefaultPii: true,
});
