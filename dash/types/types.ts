export type User =
  | {
      name?: string | null | undefined;
      email?: string | null | undefined;
      image?: string | null | undefined;
    }
  | undefined;

export type KVData = {
  route: string;
  destination: string;
  status?: Status;
};

const StatusItems = ["PENDING", "SUCCESS", "FAIL", "NEUTRAL"];
export type Status = typeof StatusItems[number];

export type KVList = {
  name: string;
}[];
