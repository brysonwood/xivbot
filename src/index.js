require('dotenv').config();
const axios = require('axios');

const xivApi = 'https://xivapi.com';

const {Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, messageLink} = require('discord.js');

const client = new Client({intents: [
  GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent
]});

const prefix = '!';

client.on("ready", () => {
  console.log("Bot is ready!");
});


function charSearch(charSearchType, charSearchResponse, message, firstName, lastName, server) {

  const charSearchy = charSearchResponse;
  axios
    .get(`${xivApi}/character/search`, {
      params: {
        name: `${firstName} ${lastName}`,
        server: server,
      },
    })
    .then((response) => {
      if (!response.data || response.data.Results.length === 0) {
        throw new Error('Name not found.');
      }

      const property = response.data.Results[0][charSearchType];
      console.log(property);
      message.channel.send(property);
    })
    .catch((error) => {
      console.log(error);
      message.channel.send('Your name was not found in the database.');
    });
}

client.on("messageCreate", msg  => {
  if (!msg.content.startsWith(prefix) || msg.author.bot) return;
    
  const args = msg.content.slice(prefix.length).split(/ +/);
  const argsArray = args;
  const command = args.shift().toLowerCase();
  
  if (command === 'language') {
    if (argsArray.length === 3) {
      charSearch('Lang', 'Hello', msg, argsArray[0], argsArray[1], argsArray[2]);
    } else if (argsArray.length !== 3) {
      console.log('Name too short');
      msg.channel.send('Please enter your full information in this format: First Last Server');
    }
  } 

  if (command === 'avatar') {
    if (argsArray.length === 3) {
      charSearch('Avatar', 'Hello', msg, argsArray[0], argsArray[1], argsArray[2]);
    } else if (argsArray.length !== 3) {
      console.log('Name too short');
      msg.channel.send('Please enter your full information in this format: First Last Server');
    }
    
  } 

  console.log("Message received.");
});

client.login(process.env.CLIENT_TOKEN);