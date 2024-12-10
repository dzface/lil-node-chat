const URL = "localhost:5000";
const ws = new WebSocket(`ws:${URL}/chat`);

ws.onopen = (e)=>{
  //console.log(e);
  console.log("웹소켓이 연결 되었습니다.");
};

//  ws.send(JSON.stringify("내가 보이니?"));
ws.onmessage = (event)=>{console.log(event)};
ws.onerror = (err)=>{console.log(`에러 발생 : ${err}`)};
ws.onclose = (e)=>{
  console.log(`웹소켓 통신종료 ${e}`);
};
