import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  gameTitle: z.string().min(1),
  format: z.enum(["SINGLE_ELIMINATION", "DOUBLE_ELIMINATION"]),
  maxPlayers: z.number().int().min(2).max(2000).default(256),
  registrationClosesAt: z.string().min(1),
  startsAt: z.string().min(1),
  prizePool: z.string().optional(),
  brandLogo: z.string().url().optional().or(z.literal("")),
  brandColorPrimary: z.string().optional(),
  brandColorSecondary: z.string().optional(),
  bannerImage: z.string().url().optional().or(z.literal("")),
});

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const campaigns = await prisma.campaign.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(campaigns);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const role = (session.user as { role?: string })?.role;
  if (role !== "BRAND_ADMIN") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const data = createSchema.parse({
      ...body,
      registrationClosesAt: body.registrationClosesAt,
      startsAt: body.startsAt,
      maxPlayers: body.maxPlayers ? Number(body.maxPlayers) : 256,
    });
    let slug = slugify(data.name);
    let suffix = 0;
    while (await prisma.campaign.findUnique({ where: { slug: suffix ? `${slug}-${suffix}` : slug } })) {
      suffix++;
    }
    const finalSlug = suffix ? `${slug}-${suffix}` : slug;
    const campaign = await prisma.campaign.create({
      data: {
        ...data,
        slug: finalSlug,
        brandLogo: data.brandLogo || null,
        bannerImage: data.bannerImage || null,
        ownerId: session.user.id!,
      },
    });
    return NextResponse.json(campaign);
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
