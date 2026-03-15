import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { redis } from "@/lib/redis";

const schema = z.object({
  campaignId: z.string().cuid(),
  username: z.string().min(1),
  email: z.string().email(),
  country: z.string().min(1),
  gameId: z.string().min(1),
  ageRange: z.string().optional(),
  platform: z.string().optional(),
  favoriteGames: z.string().optional(),
});

const RATE_LIMIT_KEY = "register:";
const RATE_LIMIT_WINDOW = 60;
const RATE_LIMIT_MAX = 5;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = schema.parse(body);

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const key = RATE_LIMIT_KEY + ip;
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, RATE_LIMIT_WINDOW);
    if (count > RATE_LIMIT_MAX) {
      return NextResponse.json(
        { message: "Too many registration attempts. Try again later." },
        { status: 429 }
      );
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: data.campaignId },
    });
    if (!campaign) {
      return NextResponse.json({ message: "Campaign not found." }, { status: 404 });
    }
    if (campaign.status !== "PUBLISHED") {
      return NextResponse.json({ message: "Registration is closed." }, { status: 400 });
    }
    if (new Date() >= campaign.registrationClosesAt) {
      return NextResponse.json({ message: "Registration has ended." }, { status: 400 });
    }

    const current = await prisma.registration.count({
      where: { campaignId: data.campaignId },
    });
    if (current >= campaign.maxPlayers) {
      return NextResponse.json({ message: "Tournament is full." }, { status: 400 });
    }

    await prisma.registration.create({
      data: {
        campaignId: data.campaignId,
        username: data.username,
        email: data.email,
        country: data.country,
        gameId: data.gameId,
        ageRange: data.ageRange ?? null,
        platform: data.platform ?? null,
        favoriteGames: data.favoriteGames ?? null,
      },
    });

    await redis.del(`campaign:${data.campaignId}:registrations`);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json(
        { message: e.errors.map((x) => x.message).join(", ") },
        { status: 400 }
      );
    }
    throw e;
  }
}
