import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { appConfig } from '../src/common/config/config';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  const passwordPlain = 'User123!';
  const passwordHash = await bcrypt.hash(passwordPlain, appConfig.bcryptRounds);

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: passwordHash,
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: passwordHash,
      role: 'USER',
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
