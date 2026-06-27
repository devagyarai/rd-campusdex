"use client";
import { useEffect, useState } from "react";
import { getPusherClient } from "@/lib/pusher-client";
import { toast } from "sonner";
import { Bell } from "lucide-react";

export function PusherListener({ role }: { role: string }) {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const pusher = getPusherClient();
    if (!pusher) return;

    const channel = pusher.subscribe("campus-channel");

    channel.bind("new-notice", (data: any) => {
      toast.info(`New Notice: ${data.title}`, {
        description: data.category
      });
      setUnreadCount((c) => c + 1);
    });

    channel.bind("new-assignment", (data: any) => {
      if (role === 'STUDENT') {
        toast.message(`New Assignment: ${data.title}`, {
          description: `Due: ${new Date(data.dueDate).toLocaleDateString()}`
        });
        setUnreadCount((c) => c + 1);
      }
    });

    return () => {
      pusher.unsubscribe("campus-channel");
    };
  }, [role]);

  if (unreadCount === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center justify-center p-3 bg-blue-600 text-white rounded-full shadow-lg cursor-pointer animate-bounce" onClick={() => setUnreadCount(0)}>
      <Bell className="w-5 h-5 mr-2" />
      <span className="font-bold">{unreadCount}</span>
    </div>
  );
}
