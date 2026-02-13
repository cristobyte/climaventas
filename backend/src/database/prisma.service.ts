import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaLibSQL } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';

function createPrismaClient(): PrismaClient {
  const tursoUrl = process.env.TURSO_DATABASE_URL;
  const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

  // Use Turso (libsql) if configured, otherwise fall back to standard SQLite
  if (tursoUrl && tursoAuthToken) {
    const libsql = createClient({
      url: tursoUrl,
      authToken: tursoAuthToken,
    });
    const adapter = new PrismaLibSQL(libsql);
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    });
  }

  // Fallback to standard SQLite (local development)
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
}

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = createPrismaClient();
  }

  async onModuleInit() {
    await this.prisma.$connect();
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  // Proxy all PrismaClient properties
  get user() { return this.prisma.user; }
  get refreshToken() { return this.prisma.refreshToken; }
  get customer() { return this.prisma.customer; }
  get product() { return this.prisma.product; }
  get sale() { return this.prisma.sale; }
  get lead() { return this.prisma.lead; }
  get interaction() { return this.prisma.interaction; }
  get partnership() { return this.prisma.partnership; }
  get referral() { return this.prisma.referral; }
  get commissionRule() { return this.prisma.commissionRule; }

  // Proxy transaction method
  $transaction<T>(fn: (prisma: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(fn);
  }
}
