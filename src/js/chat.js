const URL = "localhost:5000";
const ws = new WebSocket(`ws:${URL}/chat`);
ws.onopen = (e)=>{
  //console.log(e);
  console.log("웹소켓이 연결 되었습니다.");
  sendButton.textContent = "연결끊기";
};
//  ws.send(JSON.stringify("내가 보이니?"));
ws.onmessage = (event)=>{console.log(event)};
ws.onerror = (err)=>{console.log(`에러 발생 : ${err}`)};







const sendButton = document.querySelector(".connect-button");
sendButton.addEventListener("click", onClickSendButton);

connectStateLisener();
function onClickSendButton() {
  connectStateLisener();
};
function connectStateLisener(){
  // 연결 상태 일때 작동: 연결 끊고 버튼 이름 재연결로 변경 
  if(ws.readyState === WebSocket.OPEN){ // code 0
    ws.close(); // 웹소켓 통신 종료
    sendButton.textContent = "재연결";
  } else if(ws.readyState === WebSocket.CLOSED){
    ws.onopen = (e)=> {console.log("재연결")};
    sendButton.textContent = "연결끊기";
  };
};