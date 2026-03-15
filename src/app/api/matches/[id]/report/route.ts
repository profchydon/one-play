import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { advanceWinner } from "@/server/services/match";

const schema = z.object({
  winnerRegistrationId: z.string().cuid(),
  scorePlayer1: z.number().int().min(0).optional(),
  scorePlayer2: z.number().int().min(0).optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: matchId } = await params;
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { campaign: true },
  });
  if (!match) {
    return NextResponse.json({ message: "Match not found" }, { status: 404 });
  }
  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.errors.map((e) => e.message).join(", ") },
      { status: 400 }
    );
  }
  const { winnerRegistrationId, scorePlayer1, scorePlayer2 } = parsed.data;
  if (
    winnerRegistrationId !== match.player1RegistrationId &&
    winnerRegistrationId !== match.player2RegistrationId
  ) {
    return NextResponse.json({ message: "Invalid winner" }, { status: 400 });
  }
  if (match.status === "CONFIRMED" || match.status === "ADMIN_SET") {
    return NextResponse.json({ message: "Match already decided" }, { status: 400 });
  }

  await prisma.match.update({
    where: { id: matchId },
    data: {
      winnerRegistrationId,
      scorePlayer1: scorePlayer1 ?? null,
      scorePlayer2: scorePlayer2 ?? null,
      status: "REPORTED",
      reportedBy: winnerRegistrationId,
    },
  });
  return NextResponse.json({ ok: true });
}
