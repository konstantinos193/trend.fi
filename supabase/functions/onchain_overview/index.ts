import { fetchOnchainOverview } from "../_shared/solana/overview.ts";

type OnchainOverviewRequest = {
  walletAddress?: string;
  limit?: number;
};

function parseRequestBody(body: unknown): OnchainOverviewRequest {
  if (!body || typeof body !== "object") {
    return {};
  }
  return body as OnchainOverviewRequest;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let body: OnchainOverviewRequest;
  try {
    body = parseRequestBody(await req.json());
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  if (!body.walletAddress?.trim()) {
    return Response.json({ error: "walletAddress is required" }, { status: 400 });
  }

  const limit = Math.min(Math.max(body.limit ?? 5, 1), 20);

  try {
    const overview = await fetchOnchainOverview(body.walletAddress, limit);
    return Response.json(overview, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return Response.json({ error: message }, { status: 500 });
  }
});
