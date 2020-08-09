const Discord = require('discord.js');
const axios = require('axios');
const client = new Discord.Client();


var channelid = process.env.CHANNEL_KEY;
var serverid = process.env.SERVER_KEY;

var admins= ["232562168350900224", "141587971144024064"];
var users = [];

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  let channel = client.channels.cache.get(channelid);
  if(msg.content == "!mdDEVrank") {

    sortUsers();
    
    var count = 0;
    var found = false;
    users.forEach((elem) => {
      count += 1;
      if(elem.userid == msg.author.id) {
        channel.send("You're ranked at number: **" + count + "/" + users.length + "** tut tut tut...");     
        found = true;   
      }
    })
    if(!found) {
      channel.send("You have not been caught.          Yet....");     
    }
  }
  if(msg.content.startsWith("!mdDEVtop")) {
    var amount = parseInt(msg.content.replace("!mdDEVtop",""));
    console.log(channelid);

    sortUsers();
    var text = "<:crown:741752952737366057>";
    var loopTimes = 0;
    loopTimes = users.length > amount ? amount : users.length;

    for (i = 0; i < loopTimes; i++) {
      if (i == 0) {
        text += " <@" + users[i].userid + "> (" + users[i].timescaught + ")\n"
      } else {
        text += (i + 1) + ". <@" + users[i].userid + "> (" + users[i].timescaught + ")\n";
      }      
    }
    text += "";
    channel.send(text);
  } 
  if(msg.content.startsWith("!mdDEVchannel")){
    if(admins.includes(msg.author.id))
    {
      channelid = msg.content.replace("!mdDEVchannel", "").toString();
      channel.send("I now post into the channel: <@" + channelid + ">"); 
    } 
  }
  if(msg.content.startsWith("!mdDEVserver")){
    if(admins.includes(msg.author.id))
    {
      serverid = msg.content.replace("!mdDEVserver", "").toString();
      channel.send("I now post into the server: <@" + serverid + ">"); 
    } 
  }
});

function sortUsers() {
  users.sort(function(a, b){
    return b.timescaught - a.timescaught
  })
}

function randomInsult() {
    var insults = [
        "The alcoholic",
        "The stupid ass lookin'",
        "The neo nazi",
        "The apefucker",
        "The egghead",
        "The fattard",
        "The arse-licker",
        "The pikey",
        "The slag",
        "The trollop",
        "The nonce",
        "The son of a bitch"
    ]
    var insult = insults[Math.floor(Math.random() * insults.length)];
    return insult;
}

//-------------------------
//  ON PRESENCE UPDATE
//-------------------------
client.on('presenceUpdate', (oldPresence, newPresence) => {  
  try {
    let member = newPresence.member;
    if(member.guild.id !== serverid) {
        return;
    }
    let userID = member.user.id;
    let channel = member.guild.channels.cache.get(channelid);
    let text = "";
    if(oldPresence == undefined) {
      oldPresence.clientStatus.mobile = undefined;
    }
    if ((oldPresence.clientStatus.mobile == undefined && newPresence.clientStatus.mobile == "online") || (oldPresence == undefined && newPresence.clientStatus.mobile == "online")) {
      var found = false;
      users.forEach((elem) => {        
        if(elem.userid == userID) {
          found = true;
          elem.timescaught = parseInt(elem.timescaught) + 1;
          recordUserCatch(member, channel, userID, member.user.username, elem.timescaught);
          return true;
        }
      })
      if(!found) {
        recordUserCatch(member, channel, userID, member.user.username, 1);
      }      
    }    
  }
  catch(err) {
    console.log(err.toString());
  }    
});

//-------------------------
//  RECORD USER CATCH
//-------------------------
function recordUserCatch(member, channel, userID, username, timescaught) {
  axios.get('http://harrisondeo.me.uk/mobile_detective_bot/recordUserCatch.php?userid=' + userID + '&timesCaught=' + timescaught + '&username=' + username)
  .then(response => {
    updateUser(response.data.userID, response.data.username, parseInt(response.data.timesCaught));    
    text = randomInsult() + " <@" + member + "> " + " has been caught on their phone! - Times caught: " + timescaught;
    console.log(username + " caught: " + timescaught);
    channel.send(text);
  })
  .catch(error => {
    console.log(error);
    text = error;
  });         
}

//-------------------------
//  UPDATE USER
//-------------------------
function updateUser(puserID, pusername, ptimescaught){
  if(ptimescaught == 1) {
    addUser(puserID, pusername, ptimescaught);
    console.log(pusername + " added to database");
  } else {
    for(user of users) {
      if(user.userid == puserID) {
        user.timescaught = parseInt(ptimescaught);
      }
    }
  }
}

//-------------------------
//  ADD USER
//-------------------------
function addUser(puserID, pusername, ptimescaught) {
  users.push({
    username: pusername,
    userid: puserID,
    timescaught: ptimescaught
  })
}

//---------------------------------
//  GET RECORDS FROM DATABASE
//---------------------------------
axios.get('http://harrisondeo.me.uk/mobile_detective_bot/getAllUsers.php')
.then(response => {
    console.log(response.data);
    response.data.forEach((rec)=>{
        users.push({userid: rec.userID, username: rec.username, timescaught: parseInt(rec.timesCaught)});
    })
    console.log(users);
})
    .catch(error => {
    console.log(error);
});          

client.login(process.env.BOT_TOKEN);