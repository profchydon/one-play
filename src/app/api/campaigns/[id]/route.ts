import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  gameTitle: z.string().min(1).optional(),
  format: z.enum(["SINGLE_ELIMINATION", "DOUBLE_ELIMINATION"]).optional(),
  maxPlayers: z.number().int().min(2).max(2000).optional(),
  registrationClosesAt: z.string().min(1).optional(),
  startsAt: z.string().min(1).optional(),
  prizePool: z.string().optional(),
  brandLogo: z.string().url().optional().or(z.literal("")),
  brandColorPrimary: z.string().optional(),
  brandColorSecondary: z.string().optional(),
  bannerImage: z.string().url().optional().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED", "REGISTRATION_CLOSED", "BRACKET_LIVE", "COMPLETED"]).optional(),
});

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
    include: {
      _count: { select: { registrations: true, matches: true } },
    },
  });
  if (!campaign) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  return NextResponse.json(campaign);
}

export async function PATCH(
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
  const { id } = await params;
  const campaign = await prisma.campaign.findFirst({
    where: { id, ownerId: session.user.id },
  });
  if (!campaign) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  try {
    const body = await req.json();
    const data = updateSchema.parse({
      ...body,
      maxPlayers: body.maxPlayers != null ? Number(body.maxPlayers) : undefined,
    });
    const updated = await prisma.campaign.update({
      where: { id },
      data: {
        ...data,
        brandLogo: data.brandLogo !== undefined ? (data.brandLogo || null) : undefined,
        bannerImage: data.bannerImage !== undefined ? (data.bannerImage || null) : undefined,
      },
    });
    return NextResponse.json(updated);
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { message: e.errors.map((x) => `${x.path.join(".")}: ${x.message}`).join(", ") },
        { status: 400 }
      );
    }
    throw e;
  }
}

export async function DELETE(
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
  await prisma.campaign.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
