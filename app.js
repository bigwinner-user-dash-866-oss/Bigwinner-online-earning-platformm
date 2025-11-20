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
const udTrans = document.getElementById("udTrans");  // ⭐ NEW


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
    totalTrans: totalTrans.value   // ⭐ NEW FIELD
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
   EDIT USER
----------------------------------------- */
function openAdminEdit(name){
  editingUser=name;
  adminEdit.style.display="block";

  db.ref("users/"+name).once("value").then(snap=>{
    let d=snap.val();

    adminEdit.innerHTML = `
      <h3>Edit: ${name}</h3>
      <input id="eAcc" value="${d.account}"><br><br>
      <input id="eIfsc" value="${d.ifsc}"><br><br>
      <input id="ePass" value="${d.password}"><br><br>
      <input id="eCommission" value="${d.commission}"><br><br>
      <input id="eTeamPeople" value="${d.teamPeople}"><br><br>
      <input id="eTeamWorker" value="${d.teamWorker}"><br><br>
      <input id="eTIncome" value="${d.tIncome}"><br><br>
      <input id="eYIncome" value="${d.yIncome}"><br><br>
      <input id="eTurnover" value="${d.turnover}"><br><br>
      <input id="eTurnoverY" value="${d.turnoverYesterday}"><br><br>
      <input id="eWageOwn" value="${d.wageOwn}"><br><br>
      <input id="eWageTeam" value="${d.wageTeam}"><br><br>
      <input id="eWallet" value="${d.wallet}"><br><br>
      <input id="eTotalTrans" value="${d.totalTrans || 0}"><br><br>

      <button onclick="saveEdit()">Save</button>
      <button onclick="deleteMember()">Delete</button>
      <button onclick="adminEdit.style.display='none'">Close</button>
    `;
  });
}

window.saveEdit=function(){
  let p={
    account:eAcc.value,
    ifsc:eIfsc.value,
    password:ePass.value,
    commission:eCommission.value,
    teamPeople:eTeamPeople.value,
    teamWorker:eTeamWorker.value,
    tIncome:eTIncome.value,
    yIncome:eYIncome.value,
    turnover:eTurnover.value,
    turnoverYesterday:eTurnoverY.value,
    wageOwn:eWageOwn.value,
    wageTeam:eWageTeam.value,
    wallet:eWallet.value,
    totalTrans:eTotalTrans.value   // ⭐ NEW SAVE
  };

  db.ref("users/"+editingUser).update(p).then(()=>{
    alert("Updated");
    loadAdminList();
    loadPublicList();
  });
}

window.deleteMember=function(){
  if(!confirm("Delete?"))return;
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
  let p=prompt("Enter password");

  db.ref("users/"+name+"/password").once("value").then(snap=>{
    if(p!==snap.val()) return alert("Wrong password");
    openUserDashboard(name);
  });
}


/* -----------------------------------------
   USER DASHBOARD OPEN
----------------------------------------- */
function openUserDashboard(name){
  db.ref("users/"+name).once("value").then(snap=>{
    let d = snap.val();

    udName.textContent=name;
    udCommission.textContent=d.commission+"%";
    udIncome.textContent=INR(d.tIncome);
    udIncomeY.textContent=INR(d.yIncome)+" yesterday";
    udTurn.textContent=INR(d.turnover);
    udTurnY.textContent=INR(d.turnoverYesterday)+" yesterday";
    udWageOwn.textContent=INR(d.wageOwn);
    udWageTeam.textContent=INR(d.wageTeam);
    udWallet.textContent = INR(d.wallet);

    // ⭐ NEW TOTAL TRANSACTION LINK
    udTrans.textContent = INR(d.totalTrans);

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
  let msg=userMsg.value.trim();
  if(!msg)return;

  db.ref("messages").push({
    user:udName.textContent,
    text:msg,
    time:nowStr(),
    adminRead:false
  });

  userMsg.value="";
};


/* -----------------------------------------
   USER CHAT OPEN
----------------------------------------- */
window.openChatUser=function(){
  userChatModal.style.display="block";
  loadUserChat();
}

function loadUserChat(){
  let u = udName.textContent;
  userChatHistory.innerHTML="";

  db.ref("messages").orderByChild("user").equalTo(u).once("value")
  .then(snap=>{
    snap.forEach(c=>{
      let d = c.val();

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
   REALTIME ADMIN NOTIFICATION LISTENER
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
   LOAD ADMIN LEFT CONVERSATION LIST
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
   OPEN CONVERSATION
----------------------------------------- */
function openConversation(id){
  currentConversationId=id;

  adminChatContainer.hidden=false;
  chatPanel.hidden=false;
  noConversation.style.display="none";

  let c=convMap[id];
  chatWith.textContent=c.user;

  db.ref("messages/"+id).update({adminRead:true});
  loadChat(id);
}


/* -----------------------------------------
   LOAD CHAT HISTORY
----------------------------------------- */
function loadChat(id){
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
  if(!currentConversationId)return;

  let txt=replyText.value.trim();
  if(!txt)return;

  db.ref("messages/"+currentConversationId+"/replies").push({
    from:"admin",
    text:txt,
    time:nowStr()
  });

  replyText.value="";
  loadChat(currentConversationId);
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
        if(r.from==="admin")c++;
      });
    });
    userReplyBadge.style.display=c>0?"inline-block":"none";
    userReplyBadge.textContent=c;
  });
     }
