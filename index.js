const express = require("express");
const app = express();
const cors = require("cors");
require("./config/database");

app.use(cors());
app.use(express.static("public"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", require("./routes"));

app.use("*", (req, res, next) => {
  res.status(404).json({
    status: "fail",
    message: "Route not Found",
  });
});

app.get("/health", (req, res) => {
  res.send("Hello World!");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, (err) => {
  if (err) {
    console.log(`Error in running server ${err}`);
    return;
  }
  console.log(`Server is up and running on Port ${PORT}`);
});
