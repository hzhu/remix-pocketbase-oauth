import PocketBase from "pocketbase";

// import { singleton } from "~/utils/singleton.server";

// hard-code a unique key so we can look up the client when this module gets re-imported
export const database = () => {
  return new PocketBase(process.env.POCKETBASE_URL);
};
