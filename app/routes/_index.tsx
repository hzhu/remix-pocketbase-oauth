import { Form, Link, useLoaderData } from "@remix-run/react";
import { getSession, sessionStorage } from "~/session.server";
import {
  json,
  type LoaderFunctionArgs,
  type MetaFunction,
} from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "New Remix App" },
    { name: "description", content: "Welcome to Remix!" },
  ];
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await getSession(request);
  const email = await session.get("email");

  return json(
    { email },
    {
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session),
      },
    }
  );
};

export default function Index() {
  const { email } = useLoaderData<typeof loader>();
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8" }}>
      <h1>Home page</h1>
      {email ? (
        <div>
          <div>
            You have successfully logged in as <strong>{email}</strong>!
          </div>
          <Form action="/logout" method="post">
            <button type="submit">Logout</button>
          </Form>
        </div>
      ) : (
        <ul>
          <li>
            <Link to="/login">
              <button>Login</button>
            </Link>
          </li>
          <li>
            <Link to="/sign-up">
              <button disabled>Sign up</button>
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
}
