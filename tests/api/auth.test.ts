import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/auth/login/route';
import { prismaMock } from '../mocks/prisma';
import bcrypt from 'bcryptjs';
import * as jose from 'jose';

vi.mock('@/lib/db', () => ({
  db: prismaMock,
}));

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 for missing credentials', async () => {
    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({}),
    });
    const res = await POST(req);
    const json = await res.json();
    
    expect(res.status).toBe(400);
    expect(json.error).toBe('Missing credentials');
  });

  it('should return 401 for invalid credentials', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);
    
    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'fake@fake.com', password: 'wrong' }),
    });
    
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it('should return 200 and set cookies for valid credentials', async () => {
    const password = 'securepassword';
    const hash = await bcrypt.hash(password, 10);
    
    prismaMock.user.findUnique.mockResolvedValue({
      id: 'user1',
      email: 'student@test.com',
      password: hash,
      role: 'STUDENT',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      storageQuota: 100,
      storageUsed: 0,
      resetPasswordToken: null,
      resetPasswordExpires: null,
      lastPasswordReset: null,
      lastLoginAt: null,
      sessionVersion: 1
    } as any);

    const req = new Request('http://localhost/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'student@test.com', password }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
    
    const setCookie = res.headers.get('set-cookie');
    expect(setCookie).toContain('campusdex-token');
  });
});
