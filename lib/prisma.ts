let prismaInstance: any = null;

export async function getPrisma() {
  if (process.env.USE_PRISMA !== '1') return null;
  try {
    if (prismaInstance) return prismaInstance;
    const mod: any = await import('@prisma/client');
    const PrismaClient = mod.PrismaClient;
    prismaInstance = new PrismaClient();
    return prismaInstance;
  } catch (e) {
    return null;
  }
}

