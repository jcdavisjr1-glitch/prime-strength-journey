import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Bell } from "lucide-react";
import {
  getMyNotifications,
  markNotificationRead,
  type Notification,
} from "@/lib/notifications.functions";

function timeAgo(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  const d = Math.floor(diff / 86400);
  return `${d} day${d === 1 ? "" : "s"} ago`;
}

export function NotificationsBell() {
  const fetchNotifs = useServerFn(getMyNotifications);
  const markRead = useServerFn(markNotificationRead);
  const [items, setItems] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const load = () => {
    fetchNotifs({})
      .then(setItems)
      .catch(() => {});
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const unread = items.filter((i) => !i.read).length;

  const handleMark = async (id: string) => {
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    try {
      await markRead({ data: { id } });
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Notifications"
        className="relative p-2 rounded-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] z-50 bg-surface border border-border rounded-lg shadow-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <span className="font-display uppercase tracking-widest text-xs text-primary">
              Notifications
            </span>
            {unread > 0 && (
              <span className="text-[10px] font-display uppercase tracking-widest text-muted-foreground">
                {unread} new
              </span>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No notifications yet.
              </div>
            ) : (
              items.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 border-b border-border/60 last:border-0 ${
                    n.read ? "" : "bg-primary/5"
                  }`}
                >
                  <p className="text-sm text-foreground leading-snug">{n.message}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] font-display uppercase tracking-widest text-muted-foreground">
                      {timeAgo(n.created_at)}
                    </span>
                    {!n.read && (
                      <button
                        onClick={() => handleMark(n.id)}
                        className="text-[10px] font-display uppercase tracking-widest text-primary hover:underline"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
