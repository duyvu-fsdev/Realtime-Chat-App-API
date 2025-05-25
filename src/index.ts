import "./utils/videoQueue";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { createServer } from "http";
import path from "path";
import sequelize from "./config/dbConnect";
import router from "./routes/routes";
import { initWebSocket } from "./sockets/websocket";

dotenv.config();
let app = express();
let port = process.env.PORT;

// Create HTTP server
const server = createServer(app);

const options: cors.CorsOptions = { origin: true };

app.use(cors(options));
app.use(bodyParser.json({ limit: "100mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "100mb" }));

app.use("/api", router);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.get("/", (req: Request, res: Response) => {
  res.status(200).send({ response: "duyvu-fsdev" });
});

// Websocket
initWebSocket(server);

// connect to database
(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection to the database has been established successfully.");
    console.log("_____________________________________________________________");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
  server.listen(port, () => console.log(`Server listening on port ${port}`));
})();
