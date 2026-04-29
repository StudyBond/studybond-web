import {
  forwardAuthorizedRoute,
  type OptionalSlugRouteContext,
} from "@/lib/server/authorized-route";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, context: OptionalSlugRouteContext) {
  return forwardAuthorizedRoute(request, context, "users", "GET");
}

export async function PATCH(request: NextRequest, context: OptionalSlugRouteContext) {
  return forwardAuthorizedRoute(request, context, "users", "PATCH");
}

export async function DELETE(request: NextRequest, context: OptionalSlugRouteContext) {
  return forwardAuthorizedRoute(request, context, "users", "DELETE");
}
