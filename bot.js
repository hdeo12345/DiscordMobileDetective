const Discord = require('discord.js');
const client = new Discord.Client();


const channelid = process.env.CHANNEL_KEY;
const serverid = process.env.SERVER_KEY;

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  let channel = client.channels.cache.get(channelid);
  if(msg.content.startsWith("!rank")) {

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
  if(msg.content.startsWith("!top5")) {
    sortUsers();
    var text = "";
    var loopTimes = 0;
    loopTimes = users.length > 4 ? 5 : users.length;

    for (i = 0; i < loopTimes; i++) {
      text += (i + 1) + ") <@" + users[i].username + "> (" + users[i].timescaught + ")" + "\n";
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

var users = [
  {username: "test1", userid: "1", timescaught: 1},
  {username: "test2", userid: "2", timescaught: 2}
];


function randomInsult() {
    var insults = [
        "The alcoholic",
        "The stupid ass lookin'",
        "The neo nazi",
        "The apefucker",
        "The egghead",
        "The fattard"
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
client.login(process.env.BOT_TOKEN);
