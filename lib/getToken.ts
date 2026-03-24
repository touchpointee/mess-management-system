import { getToken } from "next-auth/jwt";

export async function getAuthToken(req: Request) {
  return getToken({ req: req as never });
}
