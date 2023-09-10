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

// Started the process of getting the lodestoneSearch function going, I found a solution but it
// doesn't use the params .get feature of axios that I want it to use.
//
// Eventually I'd like to have the functionality to parse all information from here, in addition to by
// name/server.
function lodestoneSearch(charSearchType, charSearchResponse, message, lodestoneID) {

  const charSearchy = charSearchResponse;
  const lodestoneUrl = `${xivApi}/character/${lodestoneID}`;

  axios
    .get(lodestoneUrl)
    .then((response) => {
      if (!response.data || response.data.Character.length === 0) {
        throw new Error('Name not found.');
      }

      // Show avatar.
      const lodestoneAvatar = response.data.Character.Avatar;
      console.log(`Character Avatar: ${lodestoneAvatar}`);
      message.channel.send(lodestoneAvatar);

      // Show name.
      const lodestoneName = response.data.Character.Name;
      console.log(`Character Name: ${lodestoneName}`);
      message.channel.send(`Character Name: ${lodestoneName}`);



      // Show Jobs (Will need to be updated with X.0 releases of FFXIV).
      const classJobs = response.data.Character.ClassJobs;
      let foundClassJob = [];
      let foundClassName = [];
      let counter = 0;

      // Get class jobs into separate arrays and send a message with the details. (Temporary
      // until I setup a nice looking display message.) Will save these instead and print them nicely
      // in the future.
      for (const classJob of classJobs) {
        foundClassJob.push(classJob.Level);
        foundClassName.push(classJob.UnlockedState.Name);
        console.log(counter);
        message.channel.send(`${foundClassName[counter]}: lvl${foundClassJob[counter]}`);
        counter++;
      }
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

  if (command === 'lodestone') {
    lodestoneSearch('sample', 'sample', msg, argsArray[0]);
  }

  console.log("Message received.\n----");
});

client.login(process.env.CLIENT_TOKEN);