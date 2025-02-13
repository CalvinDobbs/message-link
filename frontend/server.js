const path = require("path");
const express = require("express");

const app = express();

app.use("/public", express.static(path.join(__dirname, "public")));

app.use("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(3000, () => {
    console.log("Frontend running");
});
