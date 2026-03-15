import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateBracket } from "@/server/services/bracket";

export async function POST(
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
  if (campaign.status !== "REGISTRATION_CLOSED" && campaign.status !== "BRACKET_LIVE") {
    return NextResponse.json(
      { message: "Close registration first, then generate bracket." },
      { status: 400 }
    );
  }
  try {
    await generateBracket(id);
    await prisma.campaign.update({
      where: { id },
      data: { status: "BRACKET_LIVE" },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to generate bracket";
    return NextResponse.json({ message }, { status: 400 });
  }
}
