import { describe, it, expect, vi } from 'vitest';
import * as jose from 'jose';
import { generateToken, verifyToken } from '@/lib/auth';

// Mock process.env
vi.stubEnv('JWT_SECRET', 'test-secret-key-that-is-long-enough');

describe('JWT Utilities', () => {
  it('should generate a valid token', async () => {
    const payload = { userId: '123', role: 'STUDENT', sessionVersion: 1 };
    const token = await generateToken(payload);
    
    expect(typeof token).toBe('string');
    
    const secret = new TextEncoder().encode('test-secret-key-that-is-long-enough');
    const { payload: decoded } = await jose.jwtVerify(token, secret);
    
    expect(decoded.userId).toBe('123');
    expect(decoded.role).toBe('STUDENT');
    expect(decoded.sessionVersion).toBe(1);
  });
  
  it('should verify a valid token', async () => {
    const payload = { userId: '456', role: 'ADMIN', sessionVersion: 2 };
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

  it('should reject an invalid or tampered token', async () => {
    const verified = await verifyToken('invalid-token-string');
    expect(verified).toBeNull();
  });
});
