import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET, POST } from '@/app/api/admin/notices/route';
import { prismaMock } from '../mocks/prisma';

vi.mock('@/lib/db', () => ({
  db: prismaMock,
}));

vi.mock('@/lib/auth', () => ({
  getSessionFromRequest: vi.fn().mockResolvedValue({
    userId: 'admin1',
    role: 'ADMIN',
    sessionVersion: 1
  })
}));

describe('Admin Notices API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET should return list of notices', async () => {
    prismaMock.notice.findMany.mockResolvedValue([
      {
        id: 'notice1',
        title: 'Test Notice',
        content: 'Content',
        category: 'GENERAL',
        adminId: 'admin1',
        isPinned: false,
        isPublished: true,
        attachmentId: null,
        attachmentUrl: null,
        expiresAt: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    const req = new Request('http://localhost/api/admin/notices');
    const res = await GET(req);
    const json = await res.json();
    
    expect(res.status).toBe(200);
    expect(json.notices).toHaveLength(1);
    expect(json.notices[0].title).toBe('Test Notice');
  });

  it('POST should create a new notice', async () => {
    prismaMock.admin.findUnique.mockResolvedValue({ id: 'admin1', userId: 'admin1' } as any);
    
    prismaMock.notice.create.mockResolvedValue({
      id: 'notice2',
      title: 'New Notice',
      content: 'New Content',
      category: 'ACADEMIC',
      adminId: 'admin1',
      isPinned: true,
      isPublished: true,
      attachmentId: null,
      attachmentUrl: null,
      expiresAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const req = new Request('http://localhost/api/admin/notices', {
      method: 'POST',
      headers: {
        'x-user-id': 'admin1',
        'x-user-role': 'ADMIN'
      },
      body: JSON.stringify({
        title: 'New Notice',
        content: 'New Content',
        category: 'ACADEMIC',
        isPinned: true
      }),
    });

    const res = await POST(req);
    const json = await res.json();
    
    expect(res.status).toBe(200);
    expect(json.notice.title).toBe('New Notice');
  });
});
