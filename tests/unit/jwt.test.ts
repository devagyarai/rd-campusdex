import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as jose from 'jose';
import { signToken, verifyToken } from '@/lib/auth';
import { prismaMock } from '../mocks/prisma';

// Mock process.env
vi.stubEnv('JWT_SECRET', 'test-secret-key-that-is-long-enough');

describe('JWT Utilities', () => {
  beforeEach(() => {
    // Mock the session validation DB call to always return the matching version
    prismaMock.user.findUnique.mockResolvedValue({
      sessionVersion: 1
    } as any);
  });

  it('should generate a valid token', async () => {
    const payload = { userId: '123', role: 'STUDENT' as const, sessionVersion: 1, email: 'test@test.com' };
    const token = await signToken(payload);
    
    expect(typeof token).toBe('string');
    
    const secret = new TextEncoder().encode('test-secret-key-that-is-long-enough');
    const { payload: decoded } = await jose.jwtVerify(token, secret);
    
    expect(decoded.userId).toBe('123');
    expect(decoded.role).toBe('STUDENT');
    expect(decoded.sessionVersion).toBe(1);
  });
  
  it('should verify a valid token with matching session version', async () => {
    const payload = { userId: '456', role: 'ADMIN', sessionVersion: 1, email: 'admin@test.com' };
    const secret = new TextEncoder().encode('test-secret-key-that-is-long-enough');
    const token = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1d')
      .sign(secret);
      
    const verified = await verifyToken(token);
    expect(verified).toBeDefined();
    expect(verified?.userId).toBe('456');
    expect(verified?.role).toBe('ADMIN');
  });

  it('should reject a valid token if session version mismatches', async () => {
    // DB returns sessionVersion 2, but token has 1
    prismaMock.user.findUnique.mockResolvedValueOnce({
      sessionVersion: 2
    } as any);

    const payload = { userId: '456', role: 'ADMIN', sessionVersion: 1, email: 'admin@test.com' };
    const secret = new TextEncoder().encode('test-secret-key-that-is-long-enough');
    const token = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('1d')
      .sign(secret);
      
    const verified = await verifyToken(token);
    expect(verified).toBeNull(); // Mismatch -> null
  });

  it('should reject an invalid or tampered token', async () => {
    const verified = await verifyToken('invalid-token-string');
    expect(verified).toBeNull();
  });
});
