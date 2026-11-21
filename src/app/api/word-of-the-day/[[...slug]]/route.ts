import {
  forwardAuthorizedRoute,
  type OptionalSlugRouteContext,
} from "@/lib/server/authorized-route";
import { NextRequest } from "next/server";

/* The dashboard card: GET /me, POST /me/attempt. The public pages read the
   backend directly on the server (features/words/server.ts). */

export async function GET(request: NextRequest, context: OptionalSlugRouteContext) {
  return forwardAuthorizedRoute(request, context, "word-of-the-day", "GET");
}

export async function POST(request: NextRequest, context: OptionalSlugRouteContext) {
  return forwardAuthorizedRoute(request, context, "word-of-the-day", "POST");
}
