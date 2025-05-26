import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { executeJasminCommand } from "@/lib/jasmin-client";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get command from request body
    const { command } = await req.json();
    
    if (!command) {
      return NextResponse.json(
        { message: "Command is required" },
        { status: 400 }
      );
    }

    // Execute command
    const result = await executeJasminCommand(command);
    
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Error executing Jasmin command:", error);
    
    return NextResponse.json(
      { message: "Failed to execute command", error: String(error) },
      { status: 500 }
    );
  }
}