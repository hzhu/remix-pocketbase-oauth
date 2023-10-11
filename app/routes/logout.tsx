import { redirect } from "@remix-run/node";
import { pb } from "~/db.server";
import { getSession, sessionStorage } from "~/session.server";
import type { ActionFunction } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request);

  pb.authStore.clear();

  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
}
