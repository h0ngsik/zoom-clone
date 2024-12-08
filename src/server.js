import http from "http";
import SocketIO from "socket.io";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public"));
// /views/home.pug 파일을 렌더링 하도록 라우팅 설정
app.get("/", (req, res) => res.render("home"));

// 사용자가 다른 경로로 접근 시 "/" 경로로 리다리엑션
app.get("/*", (req, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);
httpServer.listen(3000);
