require('dotenv').config();
const axios = require('axios');

const xivApi = 'https://xivapi.com';

const {Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, messageLink} = require('discord.js');

const client = new Client({intents: [
  GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent
]});

const prefix = '!';

// Testing vars
const xivName = "Kage Dragneel";
const xivServer = "Cactuar";


client.on("ready", () => {
  console.log("Bot is ready!");
});

client.on("messageCreate", msg  => {
  if (!msg.content.startsWith(prefix) || msg.author.bot) return;
    
  const args = msg.content.slice(prefix.length).split(/ +/);
  const argsArray = args;
  const command = args.shift().toLowerCase();
  
  if (command === 'language') {
    if (argsArray.length === 3) {
      fetch(xivApi+'/character/search?name='+argsArray[0]+' '+argsArray[1]+'&server='+argsArray[2], {
        mode: 'cors' 
      })
      .then(response => response.json())
      
      .then(data => {
        msg.channel.send(data.Results[0].Lang)
      })
    } else {
      console.log('Name too short');
      msg.channel.send('Please enter your full information in this format: First Last Server');
    }
  }

  console.log("Message received.");
});

client.login(process.env.CLIENT_TOKEN);