import { prisma } from "@/lib/db";

/**
 * Generate single-elimination bracket for a campaign.
 * Seeds registrations by signup order and creates matches for each round.
 */
export async function generateSingleEliminationBracket(campaignId: string): Promise<void> {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { registrations: true },
  });
  if (!campaign) throw new Error("Campaign not found");
  if (campaign.format !== "SINGLE_ELIMINATION") throw new Error("Invalid format");

  const regs = campaign.registrations;
  const n = regs.length;
  if (n < 2) throw new Error("Need at least 2 registrations");

  // Round up to next power of 2; byes for first round
  let size = 2;
  while (size < n) size *= 2;

  const round0Size = size / 2; // number of matches in round 0
  const slots: (string | null)[] = Array(size).fill(null);
  for (let i = 0; i < n; i++) slots[i] = regs[i].id;

  let position = 0;
  const matches: { round: number; position: number; player1Id: string | null; player2Id: string | null }[] = [];

  // Round 0: pair slot 0 vs slot size-1, 1 vs size-2, ...
  for (let i = 0; i < round0Size; i++) {
    const a = slots[i];
    const b = slots[size - 1 - i];
    matches.push({
      round: 0,
      position: position++,
      player1Id: a,
      player2Id: b,
    });
  }

  await prisma.$transaction(async (tx) => {
    for (const m of matches) {
      await tx.match.create({
        data: {
          campaignId,
          round: m.round,
          position: m.position,
          player1RegistrationId: m.player1Id,
          player2RegistrationId: m.player2Id,
          status: "PENDING",
        },
      });
    }
  });
}

/**
 * Generate double-elimination: for MVP we create the same as single elimination
 * (winners bracket only). Full double-elim (losers bracket) can be added later.
 */
export async function generateDoubleEliminationBracket(campaignId: string): Promise<void> {
  return generateSingleEliminationBracket(campaignId);
}

export async function generateBracket(campaignId: string): Promise<void> {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { _count: { select: { matches: true } } },
  });
  if (!campaign) throw new Error("Campaign not found");
  if (campaign._count.matches > 0) throw new Error("Bracket already generated");

  if (campaign.format === "SINGLE_ELIMINATION") {
    await generateSingleEliminationBracket(campaignId);
  } else {
    await generateDoubleEliminationBracket(campaignId);
  }
}
