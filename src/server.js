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

// 모든 소켓은 각자의 고유한 소켓 ID가 존재한다.

// 그리고 소켓 ID를 통해, 이벤트를 주고받을 수도 있다. 그렇기 때문에 소켓은 각자의 Private room 을 가지고 있는 것과 같다.
// 그렇기 때문에 모든 소켓 ID(sids)와 다른 이름을 가진 방은 Public Room이다.
const publicRooms = () => {
  // const sids = wsServer.sockets.adapter.sids;
  // const rooms = wsServer.sockets.adapter.rooms;
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;

  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
};

wsServer.on("connection", (socket) => {
  // console.log(socket);
  socket["nickname"] = "Anonymous";

  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName);
    done();
    socket.to(roomName).emit("welcome", socket.nickname);
    wsServer.sockets.emit("room_change", publicRooms());
  });

  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname)
    );
  });

  socket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", publicRooms());
  });

  socket.on("new_message", (msg, roomName, done) => {
    socket.to(roomName).emit("new_message", `${socket.nickname}: ${msg}`);
    done();
  });

  socket.on("nickname", (nickname) => (socket["nickname"] = nickname));
});

httpServer.listen(3000);

// 서버에서 소켓은 연결된 브라우저를 의미한다.
// wss.on("connection", (socket) => {
//   sockets.push(socket);
//   socket["nickname"] = "Anonymous";
//   console.log("Connected to Browser !");
//   socket.on("close", () => console.log("Disconnected from the Browser"));
//   socket.on("message", (msg) => {
//     const message = JSON.parse(msg);
//     switch (message.type) {
//       case "new_message":
//         sockets.forEach((aSocket) =>
//           aSocket.send(
//             `${socket.nickname}: ${message.payload.toString("utf8")}`
//           )
//         );
//       case "nickname":
//         console.log(message.payload);
//         socket["nickname"] = message.payload;
//     }
//   });
// });

// httpServer.listen(3000, handleListen);
