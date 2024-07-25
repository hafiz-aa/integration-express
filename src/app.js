import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import router from "./routes.js";
import cors from "cors";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173", // Replace with your frontend's URL
    // If you need to send cookies or authorization headers
  })
);
// Enable CORS
const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/api", router);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
