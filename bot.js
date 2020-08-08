const Discord = require('discord.js');
var auth = require('./auth.json');
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if (msg.content === '!ping') {
    msg.reply('Pong!');
  }
});

var users = {};

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
    let member = newPresence.member;
    let userID = member.user.id;
    let channel = member.guild.channels.cache.get('741679888251093066');
    let text = "";
    if (oldPresence.clientStatus.mobile == undefined && newPresence.clientStatus.mobile == "online") {
        if(users[userID] == undefined) {
            users[userID] = 1;
            console.log(userID + " added to database");
        } else {
            users[userID] = users[userID] + 1;
        }
        text = randomInsult() + " <@" + member + "> " + " has been caught on their phone! - Times caught: " + users[userID];        
        channel.send(text);
    }    
});
client.login(process.env.NzQxNjgwMDY3NzI1MzYxMjYy.Xy7FYw.6lbXzpx5wtBV45JNXj2CdaXDqbA);
