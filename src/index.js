require('dotenv').config();
const axios = require('axios');
const lib = require('lib')({token: process.env.STDLIB_SECRET_TOKEN});

const xivApi = 'https://xivapi.com';

const {Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, messageLink, Embed} = require('discord.js');

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
function lodestoneSearch(message, lodestoneID) {
  const lodestoneUrl = `${xivApi}/character/${lodestoneID}`;

  axios
    .get(lodestoneUrl)
    .then(async (response) => {
      if (!response.data || response.data.Character.length === 0) {
        throw new Error('Name not found.');
      }

      // Show avatar.
      const lodestoneAvatar = response.data.Character.Avatar;

      // Show name.
      const lodestoneName = response.data.Character.Name;

      // Show Data Center and server.
      const lodestoneDataCenter = response.data.Character.DC;
      const lodestoneServer = response.data.Character.Server;

      // Show Jobs (Will need to be updated with X.0 releases of FFXIV).
      const classJobs = response.data.Character.ClassJobs;
      let foundClassJob = [];
      let foundClassName = [];
      let counter = 0;

      // Get class jobs into separate arrays.
      for (const classJob of classJobs) {
        foundClassJob.push(classJob.Level);
        foundClassName.push(classJob.UnlockedState.Name);
        counter++;
      }

      // For embed
      // Initialize header lodestoneEmbed
      const lodestoneEmbed = new EmbedBuilder()
      lodestoneEmbed.setColor(0x0099FF);
      lodestoneEmbed.setTitle(`${lodestoneName}`);
      lodestoneEmbed.setImage(`${lodestoneAvatar}`);
      lodestoneEmbed.setDescription(`${lodestoneServer} [${lodestoneDataCenter}]`)

      // Initialize tankEmbed
      const tankEmbed = new EmbedBuilder()
      tankEmbed.setColor(0x2d3a80);
      tankEmbed.setTitle("Jobs");

      // Initialize healerEmbed
      const healerEmbed = new EmbedBuilder()
      healerEmbed.setColor(0x346624);
      //healerEmbed.setTitle("Healers");

      // Initialize dpsEmbed
      const dpsEmbed = new EmbedBuilder()
      dpsEmbed.setColor(0x732828);
      //dpsEmbed.setTitle("DPS");

      // Initialize dohEmbed
      const dohEmbed = new EmbedBuilder()
      dohEmbed.setColor(0xbfa34c);
      //dohEmbed.setTitle("DoH");
      // Initialize dolEmbed
      const dolEmbed = new EmbedBuilder()
      dolEmbed.setColor(0xbf791d);
      //dolEmbed.setTitle("DoL");

      for (let i = 0; i < counter; i++) {
        if (i < 4) {
          tankEmbed.addFields( 
            { name: foundClassName[i], value: `${foundClassJob[i]}`, inline: true}
          )
        } else if (i < 8) {
          healerEmbed.addFields( 
            { name: foundClassName[i], value: `${foundClassJob[i]}`, inline: true}
          )
        } else if (i < 20) {
          dpsEmbed.addFields( 
            { name: foundClassName[i], value: `${foundClassJob[i]}`, inline: true}
          )
        } else if (i < 28) {
          dohEmbed.addFields( 
            { name: foundClassName[i], value: `${foundClassJob[i]}`, inline: true}
          )
        } else if (i < 31) {
          dolEmbed.addFields( 
            { name: foundClassName[i], value: `${foundClassJob[i]}`, inline: true}
          )
        } else {
          console.log("counter overflow.");
        }
      }

      message.channel.send({ embeds: [lodestoneEmbed] });
      message.channel.send({ embeds: [tankEmbed] });
      message.channel.send({ embeds: [healerEmbed] });
      message.channel.send({ embeds: [dpsEmbed] });
      message.channel.send({ embeds: [dohEmbed] });
      message.channel.send({ embeds: [dolEmbed] });

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
    lodestoneSearch(msg, argsArray[0]);
  }

  console.log("Message received.\n----");
});

client.login(process.env.CLIENT_TOKEN);