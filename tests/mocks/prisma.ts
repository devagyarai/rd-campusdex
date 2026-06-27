import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended';
import { db } from '@/lib/db';
import { beforeEach, vi } from 'vitest';

vi.mock('@/lib/db', () => ({
  db: mockDeep<PrismaClient>(),
}));

export const prismaMock = db as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  mockReset(prismaMock);
});
