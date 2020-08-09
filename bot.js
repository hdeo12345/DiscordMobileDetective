const Discord = require('discord.js');
const axios = require('axios');
const client = new Discord.Client();

var channelid = process.env.CHANNEL_KEY;
var serverid = process.env.SERVER_KEY;

var admins= ["232562168350900224", "141587971144024064"];
var users = [];

var invalidCommandText = "That is an invalid command, please type **!mdhelp** for a list of available commands";

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  var tempchannel = client.channels.cache.get(channelid);
  tempchannel.send("Just had to reboot real quick, don't worry, I still have all the data on you all....");
});

client.on('message', msg => {
  let channel = client.channels.cache.get(channelid);
  let message = msg.content.toLowerCase();

  if(message.startsWith("!md")){
    let command = getCommand(message);
    let input = getCommandInput(message);

    if(command == false) {
      channel.send(invalidCommandText); 
      return false;
    }

    switch(command) {
      case "help":
        var text = "";
        text += "Here is a list of commands that I understand:\n";
        text += "**!mdrank** - This will display your current rank out of all users\n";
        text += "**!mdtop <number>** - This will show the top number of users where '<number>' is a valid number provided\n";
        text += "**!mdchannel <channelid>** - This is a command reserved for admins to change the channel that the bot outputs into\n";
        text += "**!mdserver <serverid>** - This is a command reserved for admins to change the server that the bot outputs into\n";

        channel.send(text);
        console.log("Help command has been activated");
      break;
      case "rank":
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
      break;
      case "top":
        if(isNaN(input)) { channel.send(invalidCommandText); return false; }
        sortUsers();
        console.log("Outputting top " + input + "users to channel");
        var text = "<:crown:741752952737366057>";
        var loopTimes = 0;
        loopTimes = users.length > input ? input : users.length;

        for (i = 0; i < loopTimes; i++) {
          if (i == 0) {
            text += " " + users[i].username + " (" + users[i].timescaught + ")\n"
          } else {
            text += (i + 1) + ". " + users[i].username + " (" + users[i].timescaught + ")\n";
          }      
        }
        channel.send(text);
      break;
      case "channel":
        if(isNaN(input)) { channel.send(invalidCommandText); return false;}
        if(admins.includes(msg.author.id))
        {
          channelid = input;
          channel.send("I now post into the channel: <@" + channelid + ">"); 
          console.log("Bot has now been updated to send message to the channel: " + input + " by " + msg.author.id);
        } 
      break;
      case "server":
        if(isNaN(input)) { channel.send(invalidCommandText); return false;}
        if(admins.includes(msg.author.id))
        {
          serverid = input;
          channel.send("I now post into the server: <@" + serverid + ">");
          console.log("Bot has now been updated to send message to the server: " + input + " by " + msg.author.id);
        } 
      break;
    }
  }
});

function getCommand(message) {
  if(message == "!mdrank") { return "rank";}
  if(message == "!mdhelp") { return "help";}
  if(!message.includes(" ")) {return false;}

  message = message.replace("!md", "");
  var command = message.substr(0, message.indexOf(" "));

  return command;
}
function getCommandInput(message){
  return message.substr(message.indexOf(" ") + 1, message.length);
}

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
  axios.get(process.env.DATABASE_URL + '/recordUserCatch.php?userid=' + userID + '&timesCaught=' + timescaught + '&username=' + username)
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
axios.get(process.env.DATABASE_URL + '/getAllUsers.php')
.then(response => {
    response.data.forEach((rec)=>{
        users.push({userid: rec.userID, username: rec.username, timescaught: parseInt(rec.timesCaught)});
    })
    console.log("Data fetch successful! " + response.data.length + " users found");
})
.catch(error => {
    console.log(error);
});          

client.login(process.env.BOT_TOKEN);