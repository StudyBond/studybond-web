import {
  forwardAuthorizedRoute,
  type OptionalSlugRouteContext,
} from "@/lib/server/authorized-route";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest, context: OptionalSlugRouteContext) {
  return forwardAuthorizedRoute(request, context, "exams", "GET");
}

export async function POST(request: NextRequest, context: OptionalSlugRouteContext) {
  return forwardAuthorizedRoute(request, context, "exams", "POST");
}
