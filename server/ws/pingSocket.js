import { WebSocketServer } from "ws";

export default function attachPingSocket(server) {
  const wss = new WebSocketServer({
    server,
    path: "/ws/ping",
  });

  wss.on("connection", (ws, req) => {
    console.log(`Ping WS connected: ${req.socket.remoteAddress}`);

    ws.on("message", (data) => {
      try {
        const msg = JSON.parse(data);

        if (msg.type === "ping") {
          ws.send(
            JSON.stringify({
              type: "pong",
              clientTs: msg.clientTs,
              serverTs: Date.now(),
            }),
          );
        }
      } catch {
        ws.send(
          JSON.stringify({
            type: "error",
            message: "Invalid payload",
          }),
        );
      }
    });

    ws.isAlive = true;

    ws.on("pong", () => {
      ws.isAlive = true;
    });
  });

  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (!ws.isAlive) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on("close", () => clearInterval(interval));
}
