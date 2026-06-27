import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters for security'),
  CLOUDINARY_CLOUD_NAME: z.string().min(1, 'CLOUDINARY_CLOUD_NAME is required'),
  CLOUDINARY_API_KEY: z.string().min(1, 'CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required'),
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().min(1, 'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is required'),
  NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET: z.string().min(1, 'NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET is required'),
  CRON_SECRET: z.string().min(16, 'CRON_SECRET must be at least 16 characters').optional(),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PUSHER_APP_ID: z.string().min(1, 'PUSHER_APP_ID is required').optional(),
  PUSHER_SECRET: z.string().min(1, 'PUSHER_SECRET is required').optional(),
  NEXT_PUBLIC_PUSHER_KEY: z.string().min(1, 'NEXT_PUBLIC_PUSHER_KEY is required').optional(),
  NEXT_PUBLIC_PUSHER_CLUSTER: z.string().min(1, 'NEXT_PUBLIC_PUSHER_CLUSTER is required').optional(),
});

const parseEnv = () => {
  const parsed = envSchema.safeParse(process.env);
  
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables. Check your .env file.');
  }

  return parsed.data;
};

// Export the validated environment object so we can use it type-safely anywhere
export const env = parseEnv();
