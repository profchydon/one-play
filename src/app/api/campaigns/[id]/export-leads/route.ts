import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const campaign = await prisma.campaign.findFirst({
    where: { id, ownerId: session.user.id },
  });
  if (!campaign) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const registrations = await prisma.registration.findMany({
    where: { campaignId: id },
    orderBy: { createdAt: "asc" },
  });

  const headers = [
    "Username",
    "Email",
    "Country",
    "Game ID",
    "Age Range",
    "Platform",
    "Favorite Games",
    "Registered At",
  ];
  const rows = registrations.map((r) => [
    r.username,
    r.email,
    r.country,
    r.gameId,
    r.ageRange ?? "",
    r.platform ?? "",
    r.favoriteGames ?? "",
    r.createdAt.toISOString(),
  ]);

  const escape = (s: string) => {
    const t = String(s);
    if (t.includes(",") || t.includes('"') || t.includes("\n")) {
      return `"${t.replace(/"/g, '""')}"`;
    }
    return t;
  };
  const csv = [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${id}.csv"`,
    },
  });
}
