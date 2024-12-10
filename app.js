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

// 채팅요청 및 매칭 관리 ---------------------------------------
const waitingQueue =[]; // 소켓이 들어가는 리스트 소켓이 곧 유저ID
const chatRooms = {}; // 모든채팅방에 대한 정보 객체 { roomId: [socket1, socket2] }

function createRoomNumber(){
  // 나중에 중복확인하는 코드 추가
  // 4~5자리 숫자 랜덤 생성
  const number = parseInt((Math.random())*100000);
  return number;
};
function manageChatRoom(roomNumber) {
  // 유저1 소켓, 유저2소켓을 방번호 객체에 저장
  const [user1, user2] = chatRooms[roomNumber];
  // 메시지 보내기 함수
  const sendMessage = (sender, receiver, message) =>{
    receiver.send(JSON.stringify({type:"MESSAGE", room:roomNumber, message}));
  };
  // 메세지 받기
  user1.on("message", (data)=>{
    console.log(JSON.parse(data));
    sendMessage(user1, user2, data.message); 
  });
  user2.on("message", data=>{
    console.log(JSON.parse(data));
    sendMessage(user2, user1, data.message); 
  });
  // 채팅 종료 로직
  const handleDisconnect = (leavingUser, StayingUser) =>{
    // 서버 로그
    console.log(`채팅방 ${roomNumber}가 종료되었습니다.`);
    // 프론트측으로 통신종료 메세지 전달
    StayingUser.send(JSON.stringify({type: "SYSTEM", roomNumber, message:"상대방이 채팅을 떠났습니다."}));
    delete chatRooms[roomNumber]; // 채팅관리 객체 삭제
  };
  user1.on("close", ()=> handleDisconnect(user1, user2));
  user2.on("close", ()=> handleDisconnect(user2, user1));
};
// 채팅요청 및 매칭 관리 ---------------------------------------


// websocket server create
const ws = require("ws");
const moment = require("moment");
const wss = new ws.Server({server});
// websocket method
wss.on("connection", (socket, request)=>{
  console.log("웹소켓 생성");
  waitingQueue.push(socket); // 대기열에 소켓요청자 추가
  if(waitingQueue.length>=2) {
    const [user1, user2]= waitingQueue.splice(0,2); // 대기열에서 맨앞 두명 추출
    const roomNumber = createRoomNumber(); // 방 번호 생성;
    chatRooms[roomNumber] = [user1, user2]; // 방번호에 소켓 배정;
    // 유저에게 메세지 전달
    const chatData = {
      type : "SYSTEM", // SYSTEM, MESSAGE, 
      room : roomNumber, // int
      message : "상대방과 연결되었습니다!", // String
      time : moment(new Date()).format("h:mm A") // string
    };
    // 연결 이벤트메세지 전송
    user1.send(JSON.stringify(chatData));
    user2.send(JSON.stringify(chatData));
    // 채팅메세지 및 연결종료 메세지 전달 함수
    manageChatRoom(roomNumber);
  };

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





