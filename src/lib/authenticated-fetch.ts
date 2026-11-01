import { authClient } from "@/lib/auth-client";

export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
) {
  const { data, error } = await authClient.token();

  if (error || !data?.token) {
    throw new Error("Authentication required. Please login first.");
  }

  const headers = new Headers(options.headers);

  headers.set("Authorization", `Bearer ${data.token}`);

  return fetch(url, {
    ...options,
    headers,
  });
}