/* -----------------------------------------
   FIREBASE INIT (v8)
----------------------------------------- */
var firebaseConfig = {
  apiKey: "AIzaSyAXqO23ggcNB_btxIEMJDPHOSM1OGdG4oc",
  authDomain: "big-winner-91782.firebaseapp.com",
  databaseURL: "https://big-winner-91782-default-rtdb.firebaseio.com",
  projectId: "big-winner-91782",
  storageBucket: "big-winner-91782.firebasestorage.app",
  messagingSenderId: "1088925682784",
  appId: "1:1088925682784:web:69462cd6a702422ebb0705",
  measurementId: "G-L5Z6VY870S"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();


/* -----------------------------------------
   HELPERS
----------------------------------------- */
const INR = v => "₹" + (Number(v)||0).toFixed(2);
const nowStr = () => new Date().toLocaleString();


/* -----------------------------------------
   DOM REF
----------------------------------------- */
const publicList = document.getElementById("publicList");
const adminPanel = document.getElementById("adminPanel");
const adminUnreadBadge = document.getElementById("adminUnreadBadge");

const adminChatContainer = document.getElementById("adminChatContainer");
const convList = document.getElementById("convList");
const chatPanel = document.getElementById("chatPanel");
const noConversation = document.getElementById("noConversation");
const chatHistory = document.getElementById("chatHistory");
const chatWith = document.getElementById("chatWith");
const replyText = document.getElementById("replyText");

const userDashboardModal = document.getElementById("userDashboardModal");
const userChatModal = document.getElementById("userChatModal");
const userChatHistory = document.getElementById("userChatHistory");
const userReplyBadge = document.getElementById("userReplyBadge");

const udName = document.getElementById("udName");
const udCommission = document.getElementById("udCommission");
const udIncome = document.getElementById("udIncome");
const udIncomeY = document.getElementById("udIncomeY");
const udTurn = document.getElementById("udTurn");
const udTurnY = document.getElementById("udTurnY");
const udWageOwn = document.getElementById("udWageOwn");
const udWageTeam = document.getElementById("udWageTeam");
const udWallet = document.getElementById("udWallet");
const udTrans = document.getElementById("udTrans");

const newUser = document.getElementById("newUser");
const acc = document.getElementById("acc");
const ifsc = document.getElementById("ifsc");
const userPass = document.getElementById("userPass");
const commission = document.getElementById("commission");
const teamPeopleInput = document.getElementById("teamPeopleInput");
const teamWorkerInput = document.getElementById("teamWorkerInput");
const tIncome = document.getElementById("tIncome");
const yIncome = document.getElementById("yIncome");
const turnover = document.getElementById("turnover");
const turnoverYesterday = document.getElementById("turnoverYesterday");
const wageOwn = document.getElementById("wageOwn");
const wageTeam = document.getElementById("wageTeam");
const wallet = document.getElementById("wallet");
const totalTrans = document.getElementById("totalTrans");


/* -----------------------------------------
   STATE
----------------------------------------- */
let loggedInAsAdmin = false;
let editingUser = "";
let convMap = {};
let currentConversationId = "";


/* -----------------------------------------
   LOAD PUBLIC USERS
----------------------------------------- */
function loadPublicList(){
  publicList.innerHTML = "";
  db.ref("users").once("value").then(snap=>{
    if(!snap.exists()) return;
    Object.keys(snap.val()).forEach(name=>{
      let b = document.createElement("button");
      b.className="member-btn";
      b.textContent=name;
      b.onclick=()=> userLogin(name);
      publicList.appendChild(b);
    });
  });
}
loadPublicList();


/* -----------------------------------------
   ADMIN UNLOCK (8 TAPS)
----------------------------------------- */
let adminTap = 0, tapTimer;

document.getElementById("titleLink").onclick = function(){
  adminTap++;
  clearTimeout(tapTimer);
  tapTimer = setTimeout(()=> adminTap=0,2000);

  if(adminTap===8){
    adminTap=0;
    let p = prompt("Enter Admin Password");
    if(p==="Udaya@010143"){
      loggedInAsAdmin = true;
      adminPanel.style.display="block";
      loadAdminList();
      startRealtimeNotificationListener();
    } else alert("Wrong Password");
  }
};


/* -----------------------------------------
   ADD MEMBER
----------------------------------------- */
window.addMember = function(){
  let name = newUser.value.trim();
  if(!name) return alert("Enter name");

  let data = {
    account: acc.value,
    ifsc: ifsc.value,
    password: userPass.value,
    commission: commission.value,
    teamPeople: teamPeopleInput.value,
    teamWorker: teamWorkerInput.value,
    tIncome: tIncome.value,
    yIncome: yIncome.value,
    turnover: turnover.value,
    turnoverYesterday: turnoverYesterday.value,
    wageOwn: wageOwn.value,
    wageTeam: wageTeam.value,
    wallet: wallet.value,
    totalTrans: totalTrans.value
  };

  db.ref("users/"+name).set(data).then(()=>{
    alert("Added");
    loadPublicList();
    loadAdminList();
  });
};


/* -----------------------------------------
   LOAD ADMIN USER LIST
----------------------------------------- */
function loadAdminList(){
  let userList = document.getElementById("userList");
  userList.innerHTML = "";
  db.ref("users").once("value").then(snap=>{
    if(!snap.exists()) return;
    Object.keys(snap.val()).forEach(name=>{
      let b=document.createElement("button");
      b.className="member-btn";
      b.textContent=name+" (edit)";
      b.onclick=()=> openAdminEdit(name);
      userList.appendChild(b);
    });
  });
}


/* -----------------------------------------
   OPEN ADMIN EDIT
----------------------------------------- */
function openAdminEdit(name){
  editingUser=name;
  const adminEdit=document.getElementById("adminEdit");
  adminEdit.style.display="block";

  db.ref("users/"+name).once("value").then(snap=>{
    let d=snap.val();

    adminEdit.innerHTML = `
      <h3>Edit: ${name}</h3>
      <input id="eAcc" placeholder="Account No" value="${d.account||''}"><br><br>
      <input id="eIfsc" placeholder="IFSC" value="${d.ifsc||''}"><br><br>
      <input id="ePass" placeholder="Password" value="${d.password||''}"><br><br>
      <input id="eCommission" placeholder="Commission %" value="${d.commission||''}"><br><br>
      <input id="eTeamPeople" placeholder="Team People" value="${d.teamPeople||''}"><br><br>
      <input id="eTeamWorker" placeholder="Team Worker" value="${d.teamWorker||''}"><br><br>
      <input id="eTIncome" placeholder="Today Income" value="${d.tIncome||0}"><br><br>
      <input id="eYIncome" placeholder="Yesterday Income" value="${d.yIncome||0}"><br><br>
      <input id="eTurnover" placeholder="Today Turnover" value="${d.turnover||0}"><br><br>
      <input id="eTurnoverY" placeholder="Yesterday Turnover" value="${d.turnoverYesterday||0}"><br><br>
      <input id="eWageOwn" placeholder="Total Withdrawal" value="${d.wageOwn||0}"><br><br>
      <input id="eWageTeam" placeholder="Security Deposit" value="${d.wageTeam||0}"><br><br>
      <input id="eWallet" placeholder="Wallet" value="${d.wallet||0}"><br><br>
      <input id="eTotalTrans" placeholder="Total Transaction" value="${d.totalTrans||0}"><br><br>

      <button onclick="saveEdit()">Save</button>
      <button onclick="deleteMember()">Delete</button>
      <button onclick='document.getElementById("adminEdit").style.display="none"'>Close</button>
    `;
  });
}


/* -----------------------------------------
   SAVE EDIT
----------------------------------------- */
window.saveEdit=function(){
  const p={
    account: eAcc.value,
    ifsc: eIfsc.value,
    password: ePass.value,
    commission: eCommission.value,
    teamPeople: eTeamPeople.value,
    teamWorker: eTeamWorker.value,
    tIncome: eTIncome.value,
    yIncome: eYIncome.value,
    turnover: eTurnover.value,
    turnoverYesterday: eTurnoverY.value,
    wageOwn: eWageOwn.value,
    wageTeam: eWageTeam.value,
    wallet: eWallet.value,
    totalTrans: eTotalTrans.value
  };

  db.ref("users/"+editingUser).update(p).then(()=>{
    alert("Updated");
    loadAdminList();
    loadPublicList();
  });
};


/* -----------------------------------------
   DELETE MEMBER
----------------------------------------- */
window.deleteMember=function(){
  if(!confirm("Delete?")) return;
  db.ref("users/"+editingUser).remove().then(()=>{
    alert("Deleted");
    loadAdminList();
    loadPublicList();
  });
};


/* -----------------------------------------
   USER LOGIN
----------------------------------------- */
function userLogin(name){
  let p = prompt("Enter password");
  db.ref("users/"+name+"/password").once("value").then(snap=>{
    if(p!==snap.val()) return alert("Wrong password");
    openUserDashboard(name);
  });
}


/* -----------------------------------------
   OPEN USER DASHBOARD
----------------------------------------- */
function openUserDashboard(name){
  db.ref("users/"+name).once("value").then(snap=>{
    let d=snap.val();

    udName.textContent=name;
    udCommission.textContent=d.commission+"%";
    udIncome.textContent=INR(d.tIncome);
    udIncomeY.textContent=INR(d.yIncome)+" yesterday";
    udTurn.textContent=INR(d.turnover);
    udTurnY.textContent=INR(d.turnoverYesterday)+" yesterday";
    udWageOwn.textContent=INR(d.wageOwn);
    udWageTeam.textContent=INR(d.wageTeam);
    udWallet.textContent=INR(d.wallet);
    udTrans.textContent=INR(d.totalTrans);

    userDashboardModal.style.display="block";
    startUserRealtimeListeners(name);
  });
}

window.closeUserDashboard=()=>{
  userDashboardModal.style.display="none";
  userChatModal.style.display="none";
};


/* -----------------------------------------
   USER SEND MESSAGE
----------------------------------------- */
window.userSendMessage=function(){
  let m=document.getElementById("userMsg").value.trim();
  if(!m) return;

  db.ref("messages").push({
    user:udName.textContent,
    text:m,
    time:nowStr(),
    adminRead:false
  });

  document.getElementById("userMsg").value="";
  loadUserChat();
};


/* -----------------------------------------
   USER OPEN CHAT
----------------------------------------- */
window.openChatUser=function(){
  userChatModal.style.display="block";
  loadUserChat();
}

function loadUserChat(){
  let u=udName.textContent;
  userChatHistory.innerHTML="";

  db.ref("messages").orderByChild("user").equalTo(u).once("value")
  .then(snap=>{
    snap.forEach(c=>{
      let d=c.val();

      userChatHistory.innerHTML+=`
        <p><b>You:</b> ${d.text}</p>
        <small>${d.time}</small><hr>
      `;

      let rep=d.replies||{};
      Object.values(rep).forEach(r=>{
        userChatHistory.innerHTML+=`
          <p><b>${r.from==="admin"?"Admin":"You"}:</b> ${r.text}</p>
          <small>${r.time}</small><hr>
        `;
      });
    });

    userChatHistory.scrollTop=userChatHistory.scrollHeight;
  });
}


/* -----------------------------------------
   NOTIFICATIONS
----------------------------------------- */
window.openNotifications=function(){
  notifyModal.style.display="block";
  notifyList.innerHTML="";

  let arr = Object.values(convMap).sort((a,b)=>new Date(b.time)-new Date(a.time));

  if(arr.length===0){
    notifyList.innerHTML="<p>No messages</p>";
    return;
  }

  arr.forEach(c=>{
    let div=document.createElement("div");
    div.style="padding:12px;background:#ffe5e5;border-radius:10px;cursor:pointer;margin-bottom:10px;";
    div.innerHTML=`<b>${c.user}</b>: ${c.text}<br><small>${c.time}</small>`;
    div.onclick=()=>{
      notifyModal.style.display="none";
      openConversation(c.id);
    };
    notifyList.appendChild(div);
  });
}

window.closeNotifications=()=>notifyModal.style.display="none";


/* -----------------------------------------
   REALTIME ADMIN LISTENER
----------------------------------------- */
function startRealtimeNotificationListener(){
  db.ref("messages").on("value", snap=>{
    convMap={};
    snap.forEach(c=>{
      let d=c.val();
      convMap[c.key]={id:c.key,user:d.user,text:d.text,time:d.time,adminRead:d.adminRead};
    });

    updateUnread();
    refreshConvList();
  });
}

function updateUnread(){
  let c=0;
  Object.values(convMap).forEach(v=>{ if(!v.adminRead)c++; });
  adminUnreadBadge.style.display=c>0?"inline-block":"none";
  adminUnreadBadge.textContent=c;
}


/* -----------------------------------------
   CONVERSATION LIST
----------------------------------------- */
function refreshConvList(){
  convList.innerHTML="";

  let arr = Object.values(convMap).sort((a,b)=>new Date(b.time)-new Date(a.time));

  arr.forEach(c=>{
    let b=document.createElement("div");
    b.className="conv-btn";
    b.textContent=c.user+" : "+c.text;
    b.onclick=()=> openConversation(c.id);
    convList.appendChild(b);
  });
}


/* -----------------------------------------
   OPEN ADMIN CHAT
----------------------------------------- */
function openConversation(id){
  currentConversationId=id;

  adminChatContainer.hidden=false;
  chatPanel.hidden=false;
  noConversation.style.display="none";

  let c=convMap[id];
  chatWith.textContent=c.user;

  db.ref("messages/"+id).update({adminRead:true});
  loadAdminChat(id);
}


/* -----------------------------------------
   LOAD ADMIN CHAT
----------------------------------------- */
function loadAdminChat(id){
  chatHistory.innerHTML="";

  db.ref("messages/"+id).once("value").then(snap=>{
    let d=snap.val();

    chatHistory.innerHTML+=`
      <p><b>${d.user}:</b> ${d.text}</p>
      <small>${d.time}</small><hr>
    `;

    let rep=d.replies||{};
    Object.values(rep).forEach(r=>{
      chatHistory.innerHTML+=`
        <p><b>${r.from==="admin"?"Admin":d.user}:</b> ${r.text}</p>
        <small>${r.time}</small><hr>
      `;
    });

    chatHistory.scrollTop=chatHistory.scrollHeight;
  });
}


/* -----------------------------------------
   ADMIN SEND REPLY
----------------------------------------- */
window.sendReply=function(){
  if(!currentConversationId) return;

  let txt=replyText.value.trim();
  if(!txt)return;

  db.ref("messages/"+currentConversationId+"/replies").push({
    from:"admin",
    text:txt,
    time:nowStr()
  });

  replyText.value="";
  loadAdminChat(currentConversationId);
};


/* -----------------------------------------
   USER REALTIME BADGE
----------------------------------------- */
function startUserRealtimeListeners(user){
  db.ref("messages").orderByChild("user").equalTo(user).on("value",snap=>{
    let c=0;
    snap.forEach(e=>{
      let rep=e.val().replies||{};
      Object.values(rep).forEach(r=>{
        if(r.from==="admin") c++;
      });
    });
    userReplyBadge.style.display=c>0?"inline-block":"none";
    userReplyBadge.textContent=c;
  });
   }
