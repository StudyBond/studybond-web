import {
  forwardAuthorizedRoute,
  methodNotAllowed,
  type OptionalSlugRouteContext,
} from "@/lib/server/authorized-route";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  context: OptionalSlugRouteContext,
) {
  return forwardAuthorizedRoute(request, context, "notifications", "GET");
}

/* Signing a browser up for alerts, and "Not on this device". */
export async function POST(
  request: NextRequest,
  context: OptionalSlugRouteContext,
) {
  return forwardAuthorizedRoute(request, context, "notifications", "POST");
}

export async function PATCH(
  request: NextRequest,
  context: OptionalSlugRouteContext,
) {
  return forwardAuthorizedRoute(request, context, "notifications", "PATCH");
}

export async function PUT() {
  return methodNotAllowed();
}

export async function DELETE(
  request: NextRequest,
  context: OptionalSlugRouteContext,
) {
  return forwardAuthorizedRoute(request, context, "notifications", "DELETE");
}
