'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, Badge } from '@xamle/ui';
import { Activity, Wifi, WifiOff } from 'lucide-react';

interface FeedItem {
  id: string;
  type: 'policy_update' | 'contribution' | 'stats';
  message: string;
  timestamp: string;
}

export function RealtimeFeed() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? 'ws://localhost:4000';
    let socket: Socket;

    try {
      socket = io(`${wsUrl}/realtime`, {
        transports: ['websocket'],
        reconnectionAttempts: 3,
      });

      socket.on('connect', () => {
        setConnected(true);
        socket.emit('subscribe:dashboard');
      });

      socket.on('disconnect', () => setConnected(false));

      socket.on('policy:updated', (data: { title?: string; id?: string }) => {
        setItems((prev) => [
          {
            id: Date.now().toString(),
            type: 'policy_update',
            message: `Mise à jour : ${data.title ?? 'Politique'}`,
            timestamp: new Date().toISOString(),
          },
          ...prev.slice(0, 9),
        ]);
      });

      socket.on('contribution:new', () => {
        setItems((prev) => [
          {
            id: Date.now().toString(),
            type: 'contribution',
            message: 'Nouvelle contribution citoyenne soumise',
            timestamp: new Date().toISOString(),
          },
          ...prev.slice(0, 9),
        ]);
      });
    } catch {
      // WebSocket unavailable in dev without backend
    }

    return () => {
      socket?.disconnect();
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-civic-red" aria-hidden="true" />
            Activité en temps réel
          </CardTitle>
          <div className="flex items-center gap-1.5 text-xs">
            {connected ? (
              <>
                <Wifi className="h-3.5 w-3.5 text-green-500" aria-hidden="true" />
                <span className="text-green-600">En direct</span>
              </>
            ) : (
              <>
                <WifiOff className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                <span className="text-muted-foreground">Hors connexion</span>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!items.length ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Les mises à jour apparaîtront ici en temps réel.
          </p>
        ) : (
          <ul className="space-y-2" aria-live="polite" aria-label="Activité récente">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, height: 0, y: -8 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={item.type === 'policy_update' ? 'civic' : 'outline'}
                      className="text-xs"
                    >
                      {item.type === 'policy_update' ? 'Politique' : 'Contribution'}
                    </Badge>
                    <span>{item.message}</span>
                  </div>
                  <time dateTime={item.timestamp} className="text-xs text-muted-foreground shrink-0">
                    {new Date(item.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </time>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
