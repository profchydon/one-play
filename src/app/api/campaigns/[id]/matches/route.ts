import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({
    where: { id },
  });
  if (!campaign) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const matches = await prisma.match.findMany({
    where: { campaignId: id },
    orderBy: [{ round: "asc" }, { position: "asc" }],
    include: {
      player1Registration: { select: { id: true, username: true, gameId: true } },
      player2Registration: { select: { id: true, username: true, gameId: true } },
      winnerRegistration: { select: { id: true, username: true } },
    },
  });
  return NextResponse.json(matches);
}
