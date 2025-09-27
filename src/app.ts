import express from "express";
import cors from "cors";
import routes from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/auth";
import config from "./config";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);

app.get("/", (req, res) => {
  res.json({
    success: true,
    statusCode: 200,
    message: "Gym Management API is running",
    data: {
      timestamp: new Date().toISOString(),
    },
  });
});

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API Server: http://localhost:${PORT}/api`);
});
