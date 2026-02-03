import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import isInOrg from "./is-in-org";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    }),
  ],
  callbacks: {
    async signIn({ profile }) {
      const login = profile?.login as string | undefined;
      return await isInOrg(login);
    },
  },
});
