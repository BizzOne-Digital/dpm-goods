import "server-only";
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function ok<T extends Record<string, unknown>>(data: T = {} as T, status = 200) {
  return NextResponse.json({ success: true, ...data }, { status });
}

export function fail(message: string, status = 400, errors?: Record<string, string>) {
  return NextResponse.json({ success: false, message, ...(errors ? { errors } : {}) }, { status });
}

/** Converts any thrown error into a safe, consistent JSON response. */
export function handleApiError(error: unknown) {
  if (error instanceof ApiError) return fail(error.message, error.status);

  if (error instanceof ZodError) {
    const errors: Record<string, string> = {};
    for (const issue of error.issues) {
      const key = issue.path.join(".") || "form";
      if (!errors[key]) errors[key] = issue.message;
    }
    const first = Object.entries(errors)[0];
    return fail(first ? `${first[0]}: ${first[1]}` : "Invalid input", 422, errors);
  }

  const err = error as { code?: number; keyValue?: Record<string, unknown>; message?: string };
  if (err?.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? "value";
    return fail(`That ${field} is already in use.`, 409);
  }
  if (err?.message === "MONGODB_URI is not configured") {
    return fail("The database is not configured yet.", 503);
  }

  console.error("[api]", error);
  return fail("Something went wrong. Please try again.", 500);
}

export async function readJson<T = unknown>(request: Request): Promise<T> {
  try {
    return (await request.json()) as T;
  } catch {
    throw new ApiError("Invalid JSON body", 400);
  }
}
