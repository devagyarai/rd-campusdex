import PusherServer from 'pusher';
import { env } from './env';

// Server-side Pusher instance
export const pusherServer = new PusherServer({
  appId: env.PUSHER_APP_ID || process.env.PUSHER_APP_ID || '',
  key: env.NEXT_PUBLIC_PUSHER_KEY || process.env.NEXT_PUBLIC_PUSHER_KEY || '',
  secret: env.PUSHER_SECRET || process.env.PUSHER_SECRET || '',
  cluster: env.NEXT_PUBLIC_PUSHER_CLUSTER || process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us3',
  useTLS: true,
});
