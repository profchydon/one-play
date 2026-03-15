import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { RegistrationForm } from "./registration-form";
import Link from "next/link";
import { Calendar, Trophy, Users, Shield, Target } from "lucide-react";

export default async function PublicCampaignPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const campaign = await prisma.campaign.findUnique({
    where: { slug },
    include: { _count: { select: { registrations: true } } },
  });
  if (!campaign || campaign.status === "DRAFT") notFound();

  const registrationOpen =
    campaign.status === "PUBLISHED" &&
    new Date() < campaign.registrationClosesAt &&
    campaign._count.registrations < campaign.maxPlayers;

  const bgPrimary = campaign.brandColorPrimary || "#1a2432";
  const bgSecondary = campaign.brandColorSecondary || "#2c3b4d";

  return (
    <div
      className="min-h-screen font-sans text-white selection:bg-brand-green selection:text-white"
      style={{
        backgroundColor: bgPrimary,
        backgroundImage: `radial-gradient(circle at top right, ${bgSecondary}80, transparent 40%), radial-gradient(circle at bottom left, ${bgSecondary}60, transparent 40%)`,
      }}
    >
      {/* Navbar */}
      <nav className="border-b border-white/10 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {campaign.brandLogo ? (
              <img
                src={campaign.brandLogo}
                alt="Brand logo"
                className="h-10 object-contain rounded"
              />
            ) : (
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="OneVOnePlay Logo" className="h-[75px] w-auto object-contain" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-6">
            <Link
              href={`/c/${campaign.slug}/bracket`}
              className="text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              Bracket
            </Link>
            <Link
              href={`/c/${campaign.slug}/leaderboard`}
              className="text-sm font-medium text-white/80 hover:text-white transition-colors"
            >
              Leaderboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-16">
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          
          {/* Left Column: Info */}
          <div className="flex-1 space-y-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/90 text-xs font-semibold uppercase tracking-wider mb-6 border border-white/10">
                <span className={`w-2 h-2 rounded-full ${registrationOpen ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
                {registrationOpen ? "Registration Open" : "Registration Closed"}
              </div>
              <h1 className="text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-4 text-balance">
                {campaign.name}
              </h1>
              <p className="text-xl text-white/70 flex items-center gap-3">
                <Target className="w-5 h-5" />
                {campaign.gameTitle} Tournament
              </p>
            </div>

            <div 
              className="rounded-3xl p-8 border border-white/10 shadow-2xl backdrop-blur-md relative overflow-hidden"
              style={{ backgroundColor: `${bgSecondary}60` }}
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
              
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-brand-green" />
                Tournament Details
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <p className="text-sm text-white/50 uppercase tracking-wider font-semibold">Format</p>
                  <p className="text-lg font-medium flex items-center gap-2">
                    <Shield className="w-5 h-5 text-white/60" />
                    {campaign.format.replace(/_/g, " ")}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-white/50 uppercase tracking-wider font-semibold">Participants</p>
                  <p className="text-lg font-medium flex items-center gap-2">
                    <Users className="w-5 h-5 text-white/60" />
                    {campaign._count.registrations} / {campaign.maxPlayers} Registered
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-white/50 uppercase tracking-wider font-semibold">Registration Ends</p>
                  <p className="text-lg font-medium flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-white/60" />
                    {campaign.registrationClosesAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-sm text-white/50 uppercase tracking-wider font-semibold">Starts At</p>
                  <p className="text-lg font-medium flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-brand-green" />
                    {campaign.startsAt.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {campaign.prizePool && (
                <div className="mt-8 pt-8 border-t border-white/10">
                  <p className="text-sm text-white/50 uppercase tracking-wider font-semibold mb-2">Prize Pool</p>
                  <p className="text-2xl font-bold text-brand-green">{campaign.prizePool}</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Registration Form */}
          <div className="w-full lg:w-[420px] flex-shrink-0">
            <div className="bg-white rounded-3xl p-8 shadow-2xl text-brand-navy">
              <h2 className="text-2xl font-bold mb-2">Join the Arena</h2>
              <p className="text-gray-500 mb-8 font-medium">
                {registrationOpen 
                  ? "Secure your spot in the tournament now." 
                  : "Registration is currently closed."}
              </p>
              
              {registrationOpen ? (
                <RegistrationForm campaignId={campaign.id} />
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 text-center">
                  <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-semibold text-brand-navy mb-1">
                    {campaign.status === "REGISTRATION_CLOSED" || campaign.status === "BRACKET_LIVE" || campaign.status === "COMPLETED"
                      ? "Registration Closed"
                      : "Not Open Yet"}
                  </p>
                  <p className="text-gray-500 text-sm">
                    Keep an eye out for future tournaments from this brand.
                  </p>
                </div>
              )}
            </div>
          </div>
          
        </div>
      </main>
      
      <footer className="border-t border-white/10 mt-20 py-8 text-center text-white/40 text-sm font-medium flex justify-center items-center gap-2">
        Powered by <img src="/logo.png" alt="OneVOnePlay Logo" className="h-[75px] w-auto object-contain opacity-60" />
      </footer>
    </div>
  );
}
