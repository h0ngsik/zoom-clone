import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public"));
// /views/home.pug 파일을 렌더링 하도록 라우팅 설정
app.get("/", (req, res) => res.render("home"));

// 사용자가 다른 경로로 접근 시 "/" 경로로 리다리엑션
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log("Listening on http://localhost:3000");

const server = http.createServer(app);
// ws, http를 하나의 서버에서 작동할 수 있다. (꼭 함께 사용할 필요는 없음.)
const wss = new WebSocket.Server({ server });
// app.listen(3000, handleListen)

const sockets = [];

// 서버에서 소켓은 연결된 브라우저를 의미한다.
wss.on("connection", (socket) => {
  sockets.push(socket);
  socket["nickname"] = "Anonymous";
  console.log("Connected to Browser !");
  socket.on("close", () => console.log("Disconnected from the Browser"));
  socket.on("message", (msg) => {
    const message = JSON.parse(msg);
    switch (message.type) {
      case "new_message":
        sockets.forEach((aSocket) =>
          aSocket.send(
            `${socket.nickname}: ${message.payload.toString("utf8")}`
          )
        );
      case "nickname":
        console.log(message.payload);
        socket["nickname"] = message.payload;
    }
  });
});

// http 서버 위에 ws 서비스도 함께 제공.
server.listen(3000, handleListen);
