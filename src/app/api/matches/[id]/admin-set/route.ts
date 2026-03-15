import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
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
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const role = (session.user as { role?: string })?.role;
  if (role !== "BRAND_ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { id: matchId } = await params;
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { campaign: true },
  });
  if (!match) {
    return NextResponse.json({ message: "Match not found" }, { status: 404 });
  }
  const campaign = await prisma.campaign.findFirst({
    where: { id: match.campaignId, ownerId: session.user.id },
  });
  if (!campaign) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
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

  await prisma.match.update({
    where: { id: matchId },
    data: {
      winnerRegistrationId,
      scorePlayer1: scorePlayer1 ?? null,
      scorePlayer2: scorePlayer2 ?? null,
      status: "ADMIN_SET",
    },
  });
  await advanceWinner(matchId);
  return NextResponse.json({ ok: true });
}
