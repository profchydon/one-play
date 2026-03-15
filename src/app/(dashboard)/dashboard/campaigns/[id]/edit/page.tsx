import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";
import { EditCampaignForm } from "./edit-form";
import { ArrowLeft, Settings } from "lucide-react";

export default async function EditCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return null;

  const { id } = await params;
  const campaign = await prisma.campaign.findFirst({
    where: { id, ownerId: userId },
  });
  if (!campaign) notFound();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <nav className="flex items-center text-sm font-medium text-gray-500 mb-6">
        <Link href={`/dashboard/campaigns/${id}`} className="hover:text-brand-greenDark transition-colors flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-gray-100 shadow-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Campaign
        </Link>
      </nav>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden">
        <div className="bg-brand-navy p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-green/20 via-transparent to-transparent opacity-50 -mr-10 -mt-10 pointer-events-none"></div>
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10">
              <Settings className="w-6 h-6 text-brand-greenLight" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight mb-1">Edit Campaign</h1>
              <p className="text-white/70">Update settings for {campaign.name}</p>
            </div>
          </div>
        </div>

        <div className="p-8 md:p-10 bg-gray-50/30">
          <EditCampaignForm campaign={campaign} />
        </div>
      </div>
    </div>
  );
}
