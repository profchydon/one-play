import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().max(100).optional().nullable(),
});

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { name } = profileSchema.parse(body);
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: name?.trim() || null },
    });
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
