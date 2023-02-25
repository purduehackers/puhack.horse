import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.GH_ACCESS_TOKEN,
});

const isInOrg = async (login: string | null | undefined): Promise<boolean> => {
  if (!login) {
    return false;
  }
  let members = await octokit.rest.orgs.listMembers({
    org: "purduehackers",
    per_page: 100,
  });
  const member = members.data.filter((acc) => acc.login === login);
  return member.length > 0;
};

export default isInOrg;
