import { io, Socket } from "socket.io-client";

type EventCallback = (data: any) => void;

class SocketService {
  private static instance: SocketService;
  private socket: Socket | null = null;
  private subscribers: Map<string, EventCallback[]> = new Map();
  private connectionPromise: Promise<void> | null = null;
  private currentToken: string | null = null;

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  async connect(token: string): Promise<void> {
    if (this.connectionPromise) return this.connectionPromise;
    if (this.socket?.connected && token === this.currentToken) return;

    this.currentToken = token;

    this.connectionPromise = new Promise((resolve, reject) => {
      this.disconnect(); // Clean up any existing connection

      this.socket = io(process.env.NEXT_PUBLIC_API_URL!, {
        auth: { token },
        reconnectionAttempts: 3,
        reconnectionDelay: 3000,
        transports: ["websocket"],
        autoConnect: true,
      });

      const connectHandler = () => {
        this.socket?.off("connect_error", errorHandler);
        this.setupEventForwarding();
        resolve();
      };

      const errorHandler = (err: Error) => {
        this.socket?.off("connect", connectHandler);
        this.cleanup();
        reject(err);
      };

      this.socket.once("connect", connectHandler);
      this.socket.once("connect_error", errorHandler);
    });

    return this.connectionPromise.finally(() => {
      this.connectionPromise = null;
    });
  }

  private setupEventForwarding() {
    this.socket?.onAny((eventName, ...args) => {
      this.triggerEvent(eventName, ...args);
    });

    this.socket?.on("disconnect", (reason) => {
      this.triggerEvent("disconnect", reason);
    });

    this.socket?.on("connect_error", (err) => {
      this.triggerEvent("error", err);
    });
  }

  private triggerEvent(eventName: string, ...args: any[]) {
    const callbacks = this.subscribers.get(eventName) || [];
    callbacks.forEach((callback) => {
      try {
        callback(...args);
      } catch (err) {
        console.error(`Error in ${eventName} handler:`, err);
      }
    });
  }

  subscribe(eventName: string, callback: EventCallback): () => void {
    const callbacks = this.subscribers.get(eventName) || [];
    this.subscribers.set(eventName, [...callbacks, callback]);
    return () => this.unsubscribe(eventName, callback);
  }

  unsubscribe(eventName: string, callback: EventCallback): void {
    const callbacks = this.subscribers.get(eventName) || [];
    this.subscribers.set(
      eventName,
      callbacks.filter((cb) => cb !== callback)
    );
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.cleanup();
    }
  }

  private cleanup() {
    this.subscribers.clear();
    this.socket?.removeAllListeners();
    this.socket = null;
    this.currentToken = null;
  }

  get isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = SocketService.getInstance();

