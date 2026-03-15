import { prisma } from "@/lib/db";

/**
 * After a match is confirmed, advance the winner to the next round.
 * Single elimination: round N has K matches, round N+1 has K/2 matches.
 * Match (round, position) feeds into (round+1, position/2), slot position%2.
 */
export async function advanceWinner(matchId: string): Promise<void> {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { campaign: true },
  });
  if (!match || !match.winnerRegistrationId) return;
  if (match.campaign.format !== "SINGLE_ELIMINATION") return;

  const nextRound = match.round + 1;
  const nextPosition = Math.floor(match.position / 2);
  const slot = match.position % 2; // 0 = player1, 1 = player2

  const nextMatch = await prisma.match.findFirst({
    where: {
      campaignId: match.campaignId,
      round: nextRound,
      position: nextPosition,
    },
  });
  if (!nextMatch) return;

  const update = slot === 0
    ? { player1RegistrationId: match.winnerRegistrationId }
    : { player2RegistrationId: match.winnerRegistrationId };
  await prisma.match.update({
    where: { id: nextMatch.id },
    data: update,
  });
}
