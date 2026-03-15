"use client";

import { useRouter } from "next/navigation";
import type { Match, Registration } from "@prisma/client";

type MatchWithRegs = Match & {
  player1Registration: { id: string; username: string; gameId: string } | null;
  player2Registration: { id: string; username: string; gameId: string } | null;
  winnerRegistration: { id: string; username: string } | null;
};

export function BracketView({
  matches,
  campaignId,
  slug,
  isPublic,
}: {
  matches: MatchWithRegs[];
  campaignId: string;
  slug: string;
  isPublic: boolean;
}) {
  const router = useRouter();
  const byRound = matches.reduce<Record<number, MatchWithRegs[]>>((acc, m) => {
    if (!acc[m.round]) acc[m.round] = [];
    acc[m.round].push(m);
    return acc;
  }, {});
  const rounds = Object.keys(byRound)
    .map(Number)
    .sort((a, b) => a - b);

  async function reportWinner(matchId: string, winnerRegistrationId: string) {
    await fetch(`/api/matches/${matchId}/report`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winnerRegistrationId }),
    });
    router.refresh();
  }

  async function confirmResult(matchId: string) {
    await fetch(`/api/matches/${matchId}/confirm`, { method: "POST" });
    router.refresh();
  }

  async function adminSetWinner(matchId: string, winnerRegistrationId: string) {
    await fetch(`/api/matches/${matchId}/admin-set`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ winnerRegistrationId }),
    });
    router.refresh();
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-8 min-w-max py-4">
        {rounds.map((round) => (
          <div key={round} className="flex flex-col justify-around gap-4">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Round {round + 1}
            </h3>
            <div className="flex flex-col gap-4">
              {byRound[round].map((match) => (
                <div
                  key={match.id}
                  className="rounded-xl border border-gray-200 dark:border-brand-navyLight bg-white dark:bg-brand-navyDark p-3 min-w-[240px] shadow-sm relative"
                >
                  <div className="space-y-2">
                    <Slot
                      reg={match.player1Registration}
                      isWinner={match.winnerRegistrationId === match.player1RegistrationId}
                      status={match.status}
                      onReport={
                        match.status === "PENDING"
                          ? () => reportWinner(match.id, match.player1RegistrationId!)
                          : undefined
                      }
                      onConfirm={
                        match.status === "REPORTED"
                          ? () => confirmResult(match.id)
                          : undefined
                      }
                      onAdminSet={
                        !isPublic && match.status !== "CONFIRMED" && match.status !== "ADMIN_SET"
                          ? () => adminSetWinner(match.id, match.player1RegistrationId!)
                          : undefined
                      }
                      isAdmin={!isPublic}
                    />
                    <Slot
                      reg={match.player2Registration}
                      isWinner={match.winnerRegistrationId === match.player2RegistrationId}
                      status={match.status}
                      onReport={
                        match.status === "PENDING"
                          ? () => match.player2RegistrationId && reportWinner(match.id, match.player2RegistrationId)
                          : undefined
                      }
                      onConfirm={undefined}
                      onAdminSet={
                        !isPublic && match.status !== "CONFIRMED" && match.status !== "ADMIN_SET" && match.player2RegistrationId
                          ? () => adminSetWinner(match.id, match.player2RegistrationId!)
                          : undefined
                      }
                      isAdmin={!isPublic}
                    />
                  </div>
                  {(match.status === "REPORTED" || match.status === "CONFIRMED" || match.status === "ADMIN_SET") && (
                    <p className="text-xs text-gray-500 mt-1">
                      Winner: {match.winnerRegistration?.username ?? "—"}
                      {match.status === "REPORTED" && " (pending confirmation)"}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Slot({
  reg,
  isWinner,
  status,
  onReport,
  onConfirm,
  onAdminSet,
  isAdmin,
}: {
  reg: { id: string; username: string; gameId: string } | null;
  isWinner: boolean;
  status: string;
  onReport?: () => void;
  onConfirm?: () => void;
  onAdminSet?: () => void;
  isAdmin?: boolean;
}) {
  const name = reg ? reg.username : "TBD";
  return (
    <div
      className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm border ${
        isWinner 
          ? "bg-brand-green/10 border-brand-green/30 text-brand-greenDark dark:text-brand-green font-bold" 
          : "bg-gray-50 dark:bg-brand-navy border-transparent text-gray-700 dark:text-gray-300"
      }`}
    >
      <span className="truncate">{name}</span>
      <div className="flex gap-2 shrink-0">
        {onReport && <button type="button" onClick={onReport} className="text-xs font-semibold text-brand-green hover:underline">Report win</button>}
        {onConfirm && <button type="button" onClick={onConfirm} className="text-xs font-semibold text-brand-green hover:underline">Confirm</button>}
        {onAdminSet && isAdmin && <button type="button" onClick={onAdminSet} className="text-xs font-semibold text-amber-500 hover:underline">Set winner</button>}
      </div>
    </div>
  );
}
