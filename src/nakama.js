import { Client } from "@heroiclabs/nakama-js";

const useSSL = import.meta.env.VITE_NAKAMA_SSL === "true";
const host = import.meta.env.VITE_NAKAMA_HOST || "127.0.0.1";
const port = import.meta.env.VITE_NAKAMA_PORT || "7350";
const serverKey = import.meta.env.VITE_NAKAMA_SERVER_KEY || "defaultkey";

export const client = new Client(serverKey, host, port, useSSL);

let currentSession = null;
let currentSocket = null;

export const authenticate = async () => {
    if (currentSession) return currentSession;

    const deviceId = "device-" + Math.random().toString(36).slice(2);
    currentSession = await client.authenticateDevice(deviceId, true);
    console.log("Authenticated:", currentSession);

    return currentSession;
};

export const createSocket = async () => {
    const session = await authenticate();

    if (currentSocket) {
        return { socket: currentSocket, session };
    }

    currentSocket = client.createSocket();
    await currentSocket.connect(session, true);

    console.log("Socket connected");
    return { socket: currentSocket, session };
};
