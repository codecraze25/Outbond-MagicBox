import { writable, derived } from 'svelte/store';

const TIMEOUT = 3000;

interface Notification {
  id: string;
  type: 'default' | 'danger' | 'warning' | 'info' | 'success';
  message: string;
  timeout: number;
}

// Declare types for the store
import type { Writable, Readable } from 'svelte/store';

function createNotificationStore(timeout: number): {
  subscribe: Readable<Notification[]>;
  send: (
    message: string,
    type?: 'default' | 'danger' | 'warning' | 'info' | 'success',
    timeout?: number
  ) => void;
  default: (msg: string, timeout?: number) => void;
  danger: (msg: string, timeout?: number) => void;
  warning: (msg: string, timeout?: number) => void;
  info: (msg: string, timeout?: number) => void;
  success: (msg: string, timeout?: number) => void;
} {
  const _notifications: Writable<Notification[]> = writable([]);

  function send(
    message: string,
    type: 'default' | 'danger' | 'warning' | 'info' | 'success' = 'default',
    timeout: number = TIMEOUT
  ): void {
    _notifications.update((state) => {
      return [...state, { id: id(), type, message, timeout }];
    });
  }

  let timers: NodeJS.Timeout[] = [];

  const notifications: Readable<Notification[]> = derived(
    _notifications,
    ($_notifications, set) => {
      set($_notifications);
      if ($_notifications.length > 0) {
        const timer = setTimeout(() => {
          _notifications.update((state) => {
            state.shift();
            return state;
          });
        }, $_notifications[0].timeout);

        timers.push(timer);

        return () => {
          clearTimeout(timer);
          // Clean up timers if needed
          timers.forEach(clearTimeout);
        };
      }
    }
  );

  const { subscribe } = notifications;

  return {
    subscribe,
    send,
    default: (msg: string, timeout: number = TIMEOUT) =>
      send(msg, 'default', timeout),
    danger: (msg: string, timeout: number = TIMEOUT) =>
      send(msg, 'danger', timeout),
    warning: (msg: string, timeout: number = TIMEOUT) =>
      send(msg, 'warning', timeout),
    info: (msg: string, timeout: number = TIMEOUT) =>
      send(msg, 'info', timeout),
    success: (msg: string, timeout: number = TIMEOUT) =>
      send(msg, 'success', timeout),
  };
}

function id(): string {
  return '_' + Math.random().toString(36).substr(2, 9);
}

export const notifications = createNotificationStore(TIMEOUT);
