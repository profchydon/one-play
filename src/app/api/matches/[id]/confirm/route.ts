import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { advanceWinner } from "@/server/services/match";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: matchId } = await params;
  const match = await prisma.match.findUnique({
    where: { id: matchId },
  });
  if (!match) {
    return NextResponse.json({ message: "Match not found" }, { status: 404 });
  }
  if (match.status !== "REPORTED") {
    return NextResponse.json(
      { message: "Match is not pending confirmation" },
      { status: 400 }
    );
  }
  if (!match.winnerRegistrationId) {
    return NextResponse.json({ message: "No winner set" }, { status: 400 });
  }

  await prisma.match.update({
    where: { id: matchId },
    data: { status: "CONFIRMED" },
  });
  await advanceWinner(matchId);
  return NextResponse.json({ ok: true });
}
