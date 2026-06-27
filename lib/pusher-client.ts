import PusherClient from 'pusher-js';

// Client-side Pusher instance singleton
let pusherClientInstance: PusherClient | null = null;

export const getPusherClient = () => {
  if (!pusherClientInstance) {
    const key = process.env.NEXT_PUBLIC_PUSHER_KEY || '';
    const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'us3';
    
    if (key) {
      pusherClientInstance = new PusherClient(key, {
        cluster: cluster,
      });
    }
  }
  return pusherClientInstance;
};
