export type User =
  | {
      name?: string | null | undefined;
      email?: string | null | undefined;
      image?: string | null | undefined;
    }
  | undefined;

export type ConfigValues = {
  destination: string;
  visits: number;
  status?: Status;
};
export type ConfigData = Record<string, ConfigValues>;

export type Status = "PENDING" | "SUCCESS" | "FAIL" | "NEUTRAL";

export type EditItem = "ROUTE" | "DESTINATION";
