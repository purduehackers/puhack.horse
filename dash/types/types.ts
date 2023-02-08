export type User =
  | {
      name?: string | null | undefined;
      email?: string | null | undefined;
      image?: string | null | undefined;
    }
  | undefined;

export type ConfigData = {
  route: string;
  destination: string;
  visits: number;
  status?: Status;
};

const StatusItems = ["PENDING", "SUCCESS", "FAIL", "NEUTRAL"];
export type Status = typeof StatusItems[number];
