const express = require("express");
require("dotenv").config();
const cors = require("cors");
const path = require("path");
const app = express();
const userRouter = require("./routes/user.routes");
const connection = require("./db");
const playerRouter = require("./routes/player.routes");
const trackrouter = require("./routes/track.routes");

const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use("/users", userRouter)
app.use("/tracks",trackrouter)
app.use("/playlists", playerRouter);

app.listen(port, async () => {
  await connection;
  console.log("DB connected");
  console.log(`Server is running on port ${port}`);
});
