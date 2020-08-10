const Discord = require('discord.js');
const axios = require('axios');
const client = new Discord.Client();

var users = [];
var servers = [];

var invalidCommandText = "That is an invalid command, please type **!mdhelp** for a list of available commands";

class server {
  constructor(serverid, channelid) {
    this.serverid = serverid;
    this.outputchannel = channelid;
  }
  getID() {
    return this.serverid;
  }
  setID(newid) {
    this.serverid = newid;
  }
  setOutputChannel(newchannel) {
    axios.get(process.env.DATABASE_URL + '/updateServerOutputChannel.php?serverid=' + this.serverid + "&channelid=" + newchannel)
    .then(response => {    
      this.outputchannel = newchannel;     
      client.channels.cache.get(newchannel).send("Looks like I'll send all my notifications here then!"); 
    })
    .catch(error => {
      console.log(error);
      text = error;
      return false;
    });
  }
  getOutputChannel() {
    return this.outputchannel;
  }
}

client.on("guildCreate", guild => {
  if(checkIfNewServer(guild.id)) {
    console.log("Server not found! Adding " + guild.id + " to database");
    addNewServer(guild.id);
    var channel = guild.channels.cache.get(getDefaultChannel(guild));
    var text = "**Thank you for adding me to your server!**\n";
    text += "Long story short, I will detect and post whenever someone in this server hops onto Discord from their phone!\n";
    text += "You can activate me by using the prefix **!md**\n";
    text += "For a full list of commands, please type **!mdhelp**\n";
    text += "**IMPORTANT** Please make sure you set the channel that you want me to output to. You can do this by heading over to the text channel you want and typing **!mdchannelhere**\n";
    text += "That's all for now! Have fun and make sure you don't get caught.";
    channel.send(text);
  }
})
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  //Get Servers
  axios.get(process.env.DATABASE_URL + '/getAllServers.php')
  .then(response => {
    response.data.forEach((rec)=>{
      servers.push(new server(rec.serverID, rec.channelID))      
      var tempchannel = client.channels.cache.get(rec.channelID);
      if(tempchannel !== undefined) {
        tempchannel.send("Just had to reboot real quick, back online now!");
      }      
    })
    console.log("Data fetch successful! " + response.data.length + " Servers found");
  })
  .catch(error => {
    console.log(error);
  });          

  //Get Users
  axios.get(process.env.DATABASE_URL + '/getAllUsers.php')
  .then(response => {
      response.data.forEach((rec)=>{
          users.push({userid: rec.userID, username: rec.username, timescaught: parseInt(rec.timesCaught), serverID: rec.serverID});
      })
      console.log("Data fetch successful! " + response.data.length + " users found");
  })
  .catch(error => {
      console.log(error);
  });    
});
client.on('message', msg => {
  let channel = client.channels.cache.get(msg.channel.id);
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
        text += "**!mdchannelhere**  - This will set the bot to output all information in that selected channel\n";

        channel.send(text);
        console.log("Help command has been activated");
      break;
      case "rank":
        var serverUsers = getUsersByServer(msg.guild.id);
        var count = 0;
        var found = false;
        serverUsers.forEach((elem) => {
          count += 1;
          if(elem.userid == msg.author.id && elem.serverID == msg.guild.id) {
            channel.send("You're ranked at number: **" + count + "/" + serverUsers.length + "** tut tut tut...");     
            found = true;   
          }
        })
        if(!found) {
          channel.send("You have not been caught.          Yet....");     
        }
      break;
      case "top":
        if(isNaN(input)) { channel.send(invalidCommandText); return false; }
        var serverUsers = getUsersByServer(msg.guild.id);
        console.log("Outputting top " + input + "users to channel");
        var text = "Top List: \n <:crown:741752952737366057>";
        var loopTimes = 0;
        loopTimes = serverUsers.length > input ? input : serverUsers.length;

        if(loopTimes == 0) {
          channel.send("Noone has been caught yet. How very strange......");
          return false;
        }

        for (i = 0; i < loopTimes; i++) {
          if (i == 0) {
            text += " " + serverUsers[i].username + " (" + serverUsers[i].timescaught + ")\n"
          } else {
            text += (i + 1) + ". " + serverUsers[i].username + " (" + serverUsers[i].timescaught + ")\n";
          }      
        }
        channel.send(text);
      break;
      case "channelhere":
        var newChannelID = msg.channel.id;
        servers.forEach(function(value, index){
          if(value.serverid == msg.guild.id) {
            if(value.outputchannel == newChannelID) {
              channel.send("I'm already set to this channel, I wont update anything.");
              return false;
            }
            value.setOutputChannel(newChannelID);
          }
        })
      break;
    }
  }
});

function getUsersByServer(serverid) {
  var serverUsers = [];
  users.forEach(function(value, index){
    if(value.serverID == serverid) {
      serverUsers.push(value);
    }
  })
  serverUsers.sort(function(a, b){
    return b.timescaught - a.timescaught
  })
  return serverUsers;
}
function getCommand(message) {
  if(message == "!mdrank") { return "rank";}
  if(message == "!mdhelp") { return "help";}
  if(message == "!mdchannelhere") { return "channelhere";}
  if(!message.includes(" ")) {return false;}

  message = message.replace("!md", "");
  var command = message.substr(0, message.indexOf(" "));

  return command;
}
function getCommandInput(message){
  return message.substr(message.indexOf(" ") + 1, message.length);
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
//  SERVER FUNCTIONS
//-------------------------
function checkIfNewServer(serverid) {
  var found = true;
  servers.forEach(function(value, index) {
    if(value.serverid == serverid) {
      found = false;
    }
  })
  return found;
}
function addNewServer(serverid) {
  axios.get(process.env.DATABASE_URL + '/addNewServer.php?serverid=' + serverid)
  .then(response => {    
    return true;
  })
  .catch(error => {
    console.log(error);
    text = error;
    return true;
  });
  servers.push(new server(serverid));
}
function getDefaultChannel(guild) {
  let channels = guild.channels.cache;
  channelLoop:
  for (let c of channels) {
    let channelType = c[1].type;
    if (channelType === "text") {
        channelID = c[0];
        break channelLoop;
    }
  } 

  return guild.systemChannelID || channelID;
}

//-------------------------
//  ON PRESENCE UPDATE
//-------------------------
client.on('presenceUpdate', (oldPresence, newPresence) => {  
  try {
    let member = newPresence.member;
    let userID = member.user.id;
    let channel = member.guild.channels.cache.get(getDefaultChannel(member.guild));
    let text = "";
    var clientServer = "";

    //Check server    
    if(checkIfNewServer(member.guild.id)) {
      console.log("Server not found! Adding " + member.guild.id + " to database");
      addNewServer(member.guild.id);
      channel.send("You need to set up which channel you want me to output to, you can do this using the **!mdsetchannel** command");
    } else {
      servers.forEach(function(value, index){
        if(value.getID() == member.guild.id) {
          clientServer = value;
          return false;
        }
      })      
    }

    if(oldPresence == undefined) {
      oldPresence.clientStatus.mobile = undefined;
    }
    if ((oldPresence.clientStatus.mobile == undefined && newPresence.clientStatus.mobile == "online") || (oldPresence == undefined && newPresence.clientStatus.mobile == "online")) {
      //Check output channel
      if(!clientServer.getOutputChannel()) {
        console.log("No output channel found, this needs to be set by a user");
        channel.send("Someone got caught on their phone! Unfortunately You have not set a channel for me to output yet. Please use the **!mdchannelhere** command to set the channel I can talk in")
        return false;
      }
      
      channel = member.guild.channels.cache.get(clientServer.getOutputChannel());
      var found = false;
      users.forEach((elem) => {        
        if(elem.userid == userID && elem.serverID == clientServer.serverid) {
          found = true;
          elem.timescaught = parseInt(elem.timescaught) + 1;
          recordUserCatch(member, channel, userID, member.displayName, elem.timescaught, member.guild.id);
          return true;
        }
      })
      if(!found) {
        recordUserCatch(member, channel, userID, member.displayName, 1, member.guild.id);
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
function recordUserCatch(member, channel, userID, username, timescaught, serverID) {
  axios.get(process.env.DATABASE_URL + '/recordUserCatch.php?userid=' + userID + '&timesCaught=' + timescaught + '&username=' + username + '&serverid=' + serverID)
  .then(response => {
    updateUser(response.data[0].userID, response.data[0].username, parseInt(response.data[0].timesCaught), response.data[0].serverID);    
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
function updateUser(puserID, pusername, ptimescaught, serverID){
  if(ptimescaught == 1) {
    addUser(puserID, pusername, ptimescaught, serverID);
    console.log(pusername + " added to database");
  } else {
    for(user of users) {
      if(user.userid == puserID && user.serverID == serverID) {
        user.timescaught = parseInt(ptimescaught);
      }
    }
  }
}

//-------------------------
//  ADD USER
//-------------------------
function addUser(puserID, pusername, ptimescaught, pserverID) {
  users.push({
    username: pusername,
    userid: puserID,
    timescaught: ptimescaught,
    serverid: pserverID
  })
}  

client.login(process.env.BOT_TOKEN);