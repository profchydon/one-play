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

  const registrations = await prisma.registration.findMany({
    where: { campaignId: id },
    include: {
      matchesWon: { select: { id: true } },
      matchesAsPlayer1: { select: { id: true, status: true } },
      matchesAsPlayer2: { select: { id: true, status: true } },
    },
  });

  const rows = registrations.map((r) => {
    const wins = r.matchesWon.length;
    const played =
      r.matchesAsPlayer1.filter((m) => m.status === "CONFIRMED" || m.status === "ADMIN_SET").length +
      r.matchesAsPlayer2.filter((m) => m.status === "CONFIRMED" || m.status === "ADMIN_SET").length;
    return {
      registrationId: r.id,
      username: r.username,
      gameId: r.gameId,
      wins,
      losses: played - wins,
      played,
    };
  });
  rows.sort((a, b) => b.wins - a.wins || a.losses - b.losses);
  const ranked = rows.map((r, i) => ({ rank: i + 1, ...r }));

  return NextResponse.json(ranked);
}
