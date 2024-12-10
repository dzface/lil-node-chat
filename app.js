const URL = "http://localhost:5000";
const express = require("express");
const app = express();
const port = process.env.port || 5000;
const path = require("path");
const http = require("http");
const server = http.createServer(app);
server.listen(port, ()=>{
  console.log(`Server start : ${URL}`);
});


//router
app.get("/main", (req, res)=>{
  res.sendFile(path.join(__dirname, "/public/main.html"));
});
app.get("/chat", (req, res)=>{
  res.sendFile(path.join(__dirname, "/public/chat.html"));
});

//router 보다 아래 있어야 함 html script 상대 경로 제공
app.use(express.static(path.join(__dirname, "src/js")));
app.use(express.static(path.join(__dirname, "public")));
app.use((req, res)=>{
  res.status(404).send("Not found");
});

// websocket server
const ws = require("ws");
const wss = new ws.Server({server});

wss.on("connection", (socket, request)=>{
  console.log("웹소켓 생성");
  socket.send(JSON.stringify("Server : 웹소켓이 연결되었습니다.")); //나에게 보내기
  socket.on("message", (data)=>{
    const recivedData = JSON.parse(data);
    console.log(recivedData);
  });
  socket.on("error", (error)=>{
    console.log(`에러발생 코드: ${error}`);
  });
  socket.on("close", (code, reason)=>{
    console.log(`소켓통신 종료 코드 : ${code}`);
  });
});



