import { getSession, sessionStorage } from "~/session.server";
import { pb } from "~/database";
import {
  redirect,
  type LoaderFunction,
  type MetaFunction,
} from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const redirectURL = `${url.origin}/auth/google/callback`;
  const session = await getSession(request);
  const expectedState = await session.get("state");
  const expectedCodeVerifier = await await session.get("codeVerifier");
  // google sends back this state...
  const state = url.searchParams.get("state");
  const code = url.searchParams.get("code");

  const authMethods = await pb.collection("users").listAuthMethods();
  const provider = authMethods.authProviders[0];

  if (expectedState === undefined) {
    throw new Response("expectedState is undefined!", { status: 500 });
  }

  if (expectedState !== state) {
    throw new Response("Google Auth State Mismatch!", { status: 500 });
  }

  if (!code || !state) {
    throw new Response("No code or state!", { status: 500 });
  }

  try {
    const googleUserMetaData = await pb
      .collection("users")
      .authWithOAuth2Code(
        provider.name,
        code,
        expectedCodeVerifier,
        redirectURL
      );
    console.log(googleUserMetaData);
    session.set("email", googleUserMetaData.meta?.email);
  } catch (error) {
    console.error("error");
    throw new Response("Failed to authenticate.", { status: 500 });
  }

  return redirect("/", {
    headers: { "Set-Cookie": await sessionStorage.commitSession(session) },
  });
};
