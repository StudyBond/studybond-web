import {
  forwardAuthorizedRoute,
  type OptionalSlugRouteContext,
} from "@/lib/server/authorized-route";
import { NextRequest } from "next/server";

/* The new Home page: GET /api/dashboard/home and /api/dashboard/month. */
export async function GET(request: NextRequest, context: OptionalSlugRouteContext) {
  return forwardAuthorizedRoute(request, context, "dashboard", "GET");
}
