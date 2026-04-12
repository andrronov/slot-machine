import express from "express";
import cors from "cors";
import "dotenv/config";
import { checkWin } from "./services/calculation";

const PORT = process.env.PORT;
const app = express();

app.use(express.json());

app.use(
  cors({
    credentials: true,
    origin: process.env.SITE || "http://localhost:5173",
  }),
);

app.get("/test", (req, res) => {
  res.json({ message: "OK!", code: 200 });
});

app.post("/spin", async (req, res) => {
  const { stake } = req.body;
  const { win, winningLines, serverResult } = checkWin(stake);
  res.json({ win, winningLines, serverResult });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://locahost:${PORT}`);
});
