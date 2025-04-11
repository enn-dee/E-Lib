import express from "express";

const app = express();

app.get("/", (req, res) => {
   console.log(req.headers["user-agent"]);
   res.json({ message: "Home route" });
});

export default app;
