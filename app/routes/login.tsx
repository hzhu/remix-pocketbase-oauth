import { pb } from "~/database";
import { getSession, sessionStorage } from "~/session.server";
import { useFetcher } from "@remix-run/react";
import type { MetaFunction, ActionFunction } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
  const authMethods = await pb.collection("users").listAuthMethods();

  const url = new URL(request.url);
  const redirectURL = `${url.origin}/auth/google/callback`;
  const googleAuthProvider = authMethods.authProviders[0];
  const authProviderRedirect = `${googleAuthProvider.authUrl}${redirectURL}`;
  const { state, codeVerifier } = googleAuthProvider;

  const session = await getSession(request);

  session.set("state", state);
  session.set("codeVerifier", codeVerifier);

  return new Response(null, {
    headers: {
      Location: authProviderRedirect,
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
    status: 302,
  });
};

export const meta: MetaFunction = () => {
  return [
    { title: "Login" },
    {
      name: "description",
      content: "Login to this app!",
    },
  ];
};

export default function Index() {
  const fetcher = useFetcher();
  console.log(fetcher.state);
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Login</h1>
      <fetcher.Form method="post">
        <button>
          {fetcher.state === "loading" || fetcher.state === "submitting"
            ? "Continuing…"
            : "Continue with Google"}
        </button>
      </fetcher.Form>
      <fetcher.Form method="post">
        <button disabled>Continue with GitHub (soon)</button>
      </fetcher.Form>
    </div>
  );
}
