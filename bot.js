const Discord = require('discord.js');
const client = new Discord.Client();

const channelid = process.env.CHANNEL_KEY;
const serverid = process.env.SERVER_KEY;

var users = [];
var servers = "";

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  let channel = client.channels.cache.get(channelid);
  if(msg.content == "!rank") {

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
  if(msg.content.startsWith("!top")) {
    var amount = parseInt(msg.content.replace("!top",""));

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
        "The nonce",
        "The carry",
        "The set 3 maths kid",
        "The 'shouldnt be let out the house alone'",
        "The douchebaggette",
        "The virg",
        "The arse-licker"
    ]
    var insult = insults[Math.floor(Math.random() * insults.length)];
    return insult;
}

client.on('presenceUpdate', (oldPresence, newPresence) => {
  
  try {
    let member = newPresence.member;
    if(member.guild.id !== serverid) {
        return;
    }
    let userID = member.user.id;
    let channel = member.guild.channels.cache.get(channelid);
    let text = "";
    if (oldPresence.clientStatus.mobile == undefined && newPresence.clientStatus.mobile == "online") {
      var found = false;
      users.forEach((elem) => {        
        if(elem.userid == userID) {
          found = true;
          elem.timescaught = elem.timescaught + 1;
          text = randomInsult() + " <@" + member + "> " + " has been caught on their phone! - Times caught: " + elem.timescaught;
          return true;
        }
      })
      if(!found) {
        users.push({username: member.user.username, userid: userID, timescaught: 1});
        console.log("added to database");
        text = randomInsult() + " <@" + member + "> " + " has been caught on their phone! - Times caught: 1";
      }                     
      channel.send(text);
    }    
  }
  catch(err) {
    console.log(err);
  }
    
});

function isValidServer(serverID) {

}

client.login(process.env.BOT_TOKEN);
