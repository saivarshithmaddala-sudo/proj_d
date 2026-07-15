import { NextResponse } from "next/server";

export type ErrorCode = "INVALID_REQUEST" | "INTERNAL_ERROR";

export function apiError(
  code: ErrorCode,
  message: string,
  status: number = 400
) {
  return NextResponse.json(
    {
      error: {
        code,
        message,
      },
    },
    { status }
  );
}

export function handleServerError(error: unknown) {
  console.error("Unhandled Server Error:", error);
  return apiError(
    "INTERNAL_ERROR",
    "An internal server error occurred.",
    500
  );
}
