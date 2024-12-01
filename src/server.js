import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");

app.use("/public", express.static(__dirname + "/public"));
// /views/home.pug 파일을 렌더링 하도록 라우팅 설정
app.get("/", (req, res) => res.render("home"));

const handleListen = () => console.log("Listening on http://localhost:3000");

// 3000번 포트로 서버 실행
app.listen(3000, handleListen);