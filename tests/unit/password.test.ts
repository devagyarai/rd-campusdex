import { describe, it, expect } from 'vitest';
import bcrypt from 'bcryptjs';

describe('Password Hashing Utilities', () => {
  it('should hash a password and verify it successfully', async () => {
    const password = 'enterprise-secure-password';
    const hash = await bcrypt.hash(password, 10);
    
    expect(hash).toBeDefined();
    expect(hash).not.toBe(password);
    
    const isValid = await bcrypt.compare(password, hash);
    expect(isValid).toBe(true);
  });
  
  it('should reject an invalid password', async () => {
    const password = 'enterprise-secure-password';
    const wrongPassword = 'password123';
    const hash = await bcrypt.hash(password, 10);
    
    const isValid = await bcrypt.compare(wrongPassword, hash);
    expect(isValid).toBe(false);
  });
});
