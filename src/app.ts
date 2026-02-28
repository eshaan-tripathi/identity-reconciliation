import express from "express";
import identifyRoute from "./routes/identify.route";

const app = express();

app.use(express.json());

app.get("/", (_, res) => {
  res.json({ status: "running" });
});

app.use("/identify", identifyRoute);

export default app;