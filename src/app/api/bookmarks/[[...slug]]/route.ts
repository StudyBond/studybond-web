import {
  forwardAuthorizedRoute,
  type OptionalSlugRouteContext,
} from "@/lib/server/authorized-route";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, context: OptionalSlugRouteContext) {
  return forwardAuthorizedRoute(request, context, "bookmarks", "GET");
}

export async function POST(request: NextRequest, context: OptionalSlugRouteContext) {
  return forwardAuthorizedRoute(request, context, "bookmarks", "POST");
}

export async function PATCH(request: NextRequest, context: OptionalSlugRouteContext) {
  return forwardAuthorizedRoute(request, context, "bookmarks", "PATCH");
}

export async function DELETE(request: NextRequest, context: OptionalSlugRouteContext) {
  return forwardAuthorizedRoute(request, context, "bookmarks", "DELETE");
}
