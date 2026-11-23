import {
  forwardAuthorizedRoute,
  type OptionalSlugRouteContext,
} from "@/lib/server/authorized-route";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, context: OptionalSlugRouteContext) {
  return forwardAuthorizedRoute(request, context, "institutions", "GET");
}

/* PUT /api/institutions/active switches the student's board. */
export async function PUT(request: NextRequest, context: OptionalSlugRouteContext) {
  return forwardAuthorizedRoute(request, context, "institutions", "PUT");
}
