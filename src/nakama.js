import { Client } from "@heroiclabs/nakama-js";

const client = new Client(
  "defaultkey",
  "127.0.0.1",
  "7350",
  false       
);

let session = null;
let socket = null;

export const authenticate = async () => {
  const deviceId = "device-" + Math.random().toString(36).substring(2, 15);

  session = await client.authenticateDevice(deviceId, true);
  console.log("Authenticated:", session);
};

export const createSocket = async () => {
  if (!session) {
    await authenticate();
  }

  socket = client.createSocket();

  await socket.connect(session, true);
  console.log("Socket connected");

  return { socket, session };
};

export { client, session, socket };