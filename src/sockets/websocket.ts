import { WebSocket, WebSocketServer } from "ws";
import { Server } from "http";

interface ExtendedWebSocket extends WebSocket {
  userId?: number;
  socketId?: string;
}
let wss: WebSocketServer | null = null;
export const initWebSocket = (server: Server) => {
  if (!wss) {
    wss = new WebSocketServer({ server });
    wss.on("connection", (ws: ExtendedWebSocket, req) => {
      const params = new URLSearchParams(req.url?.split("?")[1]);
      const userId = params.get("userId");

      if (!userId) return ws.close();
      ws.socketId = crypto.randomUUID();
      ws.userId = parseInt(userId, 10);
      ws.on("message", (message) => {
        try {
          const data = JSON.parse(message.toString());
          if (data.type === "USER_TYPING") {
            wss?.clients.forEach((client: ExtendedWebSocket) => {
              if (client.readyState === WebSocket.OPEN && client.userId !== ws.userId) {
                client.send(JSON.stringify({ type: "USER_TYPING", data: data.data }));
              }
            });
          }
        } catch (error) {
          console.error("❌ Lỗi khi xử lý tin nhắn WebSocket:", error);
        }
      });

      ws.send(JSON.stringify({ type: "SOCKET_ID", socketId: ws.socketId }));
      ws.on("error", (error) => {
        console.error("❌ WebSocket error:", error);
      });
    });
  }
};

export const getWebSocketServer = (): WebSocketServer | null => wss;
