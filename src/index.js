require('dotenv').config();
const axios = require('axios');

// Api constant for clarity.
const xivApi = 'https://xivapi.com';

const {Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, messageLink, Embed} = require('discord.js');

const client = new Client({intents: [
  GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent
]});

// Prefix declared for commands. 
// TODO: add ability to change prefix.
const prefix = '!';

client.on("ready", () => {
  console.log("Bot is ready!");
});

// Searches given the type of search, message for discord.js to use, first name, last name, and server.
function charSearch(charSearchType, message, firstName, lastName, server) {
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
      propertyString = property.toString();
      console.log(propertyString);
      message.channel.send(propertyString);
    })
    .catch((error) => {
      console.log(error);
      message.channel.send('Your name was not found.');
    });
}

// Searches given the message for discord.js to use and lodestone ID.
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

      // Show Free Company.
      const lodestoneFreeCompany = response.data.Character.FreeCompanyName;

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
      lodestoneEmbed.setDescription(`${lodestoneServer} [${lodestoneDataCenter}]\n\nFree Company: ${lodestoneFreeCompany}`)

      // Initialize tankEmbed
      const tankEmbed = new EmbedBuilder()
      tankEmbed.setColor(0x2d3a80);
      tankEmbed.setTitle("Jobs");

      // Initialize healerEmbed
      const healerEmbed = new EmbedBuilder()
      healerEmbed.setColor(0x346624);
      

      // Initialize dpsEmbed
      const dpsEmbed = new EmbedBuilder()
      dpsEmbed.setColor(0x732828);
      //dpsEmbed.setTitle("DPS");

      // Initialize dohEmbed
      const dohEmbed = new EmbedBuilder()
      dohEmbed.setColor(0xbfa34c);
      
      // Initialize dolEmbed
      const dolEmbed = new EmbedBuilder()
      dolEmbed.setColor(0xbf791d);
      

      // For every element that was in the foundClassJobs array, iterate.
      for (let i = 0; i < counter; i++) {
        // DPS embed.
        if (i < 4) {
          tankEmbed.addFields( 
            { name: foundClassName[i], value: `${foundClassJob[i]}`, inline: true}
          )
          // Healer embed.
        } else if (i < 8) {
          healerEmbed.addFields( 
            { name: foundClassName[i], value: `${foundClassJob[i]}`, inline: true}
          )
          // DPS embed.
        } else if (i < 20) {
          dpsEmbed.addFields( 
            { name: foundClassName[i], value: `${foundClassJob[i]}`, inline: true}
          )
          // DoH embed.
        } else if (i < 28) {
          dohEmbed.addFields( 
            { name: foundClassName[i], value: `${foundClassJob[i]}`, inline: true}
          )
          // DoL embed.
        } else if (i < 31) {
          dolEmbed.addFields( 
            { name: foundClassName[i], value: `${foundClassJob[i]}`, inline: true}
          )
        } else {
          console.log("counter overflow.");
        }
      }

      // Send all of the embeds.
      message.channel.send({ embeds: [lodestoneEmbed] });
      message.channel.send({ embeds: [tankEmbed] });
      message.channel.send({ embeds: [healerEmbed] });
      message.channel.send({ embeds: [dpsEmbed] });
      message.channel.send({ embeds: [dohEmbed] });
      message.channel.send({ embeds: [dolEmbed] });

    })
    // Catch-all for errors, print to console.
    .catch((error) => {
      console.log(error);
      message.channel.send('Your ID was not found.');
    });
}

function pushTo(list, server) {
  let fullServerList = `__**${server}**__\n`;
  for (listItem of list) {
    fullServerList += `${listItem}\n`
  }
  return `${fullServerList}\n`;
}

// Searches servers.
function serverSearch(message, searchType, serverRegion) {
  axios
    .get(`${xivApi}/${searchType}`)
    .then((response) => {
      if (serverRegion === 'na' || serverRegion === 'north america') {
        // Initialize serverlist for appending servers.
        let serverList = '';

        // Add Aether servers to list.
        const aetherList = response.data.Aether;
        serverList += pushTo(aetherList, 'Aether', serverList);

        // Add Crystal servers to list.
        const crystalList = response.data.Crystal;
        serverList += pushTo(crystalList, 'Crystal', serverList);

        // Add Dynamis servers to list.
        const dynamisList = response.data.Dynamis;
        serverList += pushTo(dynamisList, 'Dynamis', serverList);

        // Create server list embed.
        const naEmbed = new EmbedBuilder()
          .setColor(0x0099FF)
          .setTitle('North America')
          .setDescription(serverList);

        // Push embed to channel.
        message.channel.send({ embeds: [naEmbed] });

      } else if (serverRegion === 'eu' || serverRegion === 'europe') {
        // Initialize serverlist for appending servers.
        let serverList = '';

        // Add Chaos servers to list.
        const chaosList = response.data.Chaos;
        serverList += pushTo(chaosList, 'Chaos', serverList);

        // Add Light servers to list.
        const lightList = response.data.Light;
        serverList += pushTo(lightList, 'Light', serverList);
        
        const euEmbed = new EmbedBuilder()
          .setColor(0x0099FF)
          .setTitle('Europe')
          .setDescription(serverList);

        // Push embed to channel.
        message.channel.send({ embeds: [euEmbed] });

      } else if (serverRegion === 'jp' || serverRegion === 'japan') {
        // Initialize serverlist for appending servers.
        let serverList = '';
        
        // Add Elemental servers to list.
        const elementalList = response.data.Elemental;
        serverList += pushTo(elementalList, 'Chaos', serverList);

        // Add Gaia servers to list.
        const gaiaList = response.data.Gaia;
        serverList += pushTo(gaiaList, 'Gaia', serverList);

        // Add Mana servers to list.
        const manaList = response.data.Mana;
        serverList += pushTo(manaList, 'Mana', serverList);

        // Add Meteor servers to list.
        const meteorList = response.data.Meteor;
        serverList += pushTo(meteorList, 'Meteor', serverList);

        const jpEmbed = new EmbedBuilder()
          .setColor(0x0099FF)
          .setTitle('Japan')
          .setDescription(serverList);

        // Push embed to channel.
        message.channel.send({ embeds: [jpEmbed] });

      } else if (serverRegion ==='oce' || serverRegion === 'oceania') {
        // Initialize serverlist for appending servers.
        let serverList = '';

        // Add Mana servers to list.
        const manaList = response.data.Mana;
        serverList += pushTo(manaList, 'Mana', serverList);

        const oceEmbed = new EmbedBuilder()
          .setColor(0x0099FF)
          .setTitle('Oceania')
          .setDescription(serverList);

        // Push embed to channel.
        message.channel.send({ embeds: [oceEmbed] });

      } else {
        console.log('Region is not in the list. Please use the command format:\n!serverlist [Server Region]\nRegion list is: NA or North America, EU or Europe, JP or Japan, OCE or Oceania');
        message.channel.send('Region is not in the list. Please use the command format:\n!serverlist [Server Region]\nRegion list is: NA or North America, EU or Europe, JP or Japan, OCE or Oceania');
      }
    })
    .catch((error) => {
      console.log(error);
      message.channel.send('Region is not in the list. Please use the command format:\n!serverlist [Server Region]\nRegion list is: NA or North America, EU or Europe, JP or Japan, OCE or Oceania');
    })
}

client.on("messageCreate", msg  => {
  if (!msg.content.startsWith(prefix) || msg.author.bot) return;
    
  // Slice the content of the command at spaces.
  const args = msg.content.slice(prefix.length).split(/ +/);

  // Shift all args to lowercase so things don't break.
  const command = args.shift().toLowerCase();

  // Put args[] into argsArray[] as lowercase.
  let argsArray = [];
  for (item of args) {
    argsArray.push(item.toLowerCase());
  }
  
  
  // Print when message has been received and slices properly.
  console.log("Message received.");
  
  // Responds with character name, server, data center, and job levels.
  if (command === 'lodestone') {
    console.log("Message type: lodestone\n----");
    if (argsArray.length === 1) {
      lodestoneSearch(msg, argsArray[0]);
    } else if (argsArray.length === 0) {
      console.log('No args.');
      msg.channel.send('!lodestone [ID]')
    } else {
      console.log('ID not in the right format.');
      msg.channel.send('Please enter your full information in this format: \n!lodestone [ID]');
    }
  }
  // Responds with character's chosen languages.
  if (command === 'language') {
    console.log("Message type: language\n----");
    if (argsArray.length === 3) {
      charSearch('Lang', msg, argsArray[0], argsArray[1], argsArray[2]);
    } else if (argsArray.length === 0) {
      console.log('No args.');
      msg.channel.send('!language [First Name] [Last Name] [Server]')
    } else {
      console.log('Too many / Not enough words.');
      msg.channel.send('Please enter your full information in this format: \n!language [First Name] [Last Name] [Server]');
    }
  } 

  // Responds with character's avatar from the Lodestone.
  if (command === 'avatar') {
    console.log("Message type: avatar\n----");
    if (argsArray.length === 3) {
      charSearch('Avatar', msg, argsArray[0], argsArray[1], argsArray[2]);
    } else if (argsArray.length === 0) {
      console.log('No args.');
      msg.channel.send('!avatar [First Name] [Last Name] [Server]')
    } else {
      console.log('Too many / Not enough words.');
      msg.channel.send('Please enter your full information in this format: \n!avatar [First Name] [Last Name] [Server]');
    }
    
  } 

  // Responds with character's ID from the Lodestone.
  if (command === 'id') {
    if (argsArray.length === 3) {
      charSearch('ID', msg, argsArray[0], argsArray[1], argsArray[2]);
    } else if (argsArray.length === 0) {
      console.log('No args.');
      msg.channel.send('!id [First Name] [Last Name] [Server]')
    } else {
      console.log('Too many / Not enough words.');
      msg.channel.send('Please enter your full information in this format: \n!id [First Name] [Last Name] [Server]');
    }
  }

  // Respondes with a list of servers sorted by DC.
  if (command === 'serverlist') {
    console.log("Message type: serverlist\n----");
    if (argsArray.length === 1) {
        serverSearch(msg, 'servers/dc', argsArray[0]);
    } else if (argsArray.length === 0) {
      console.log('No args.');
      msg.channel.send('!serverlist [Region]')
    } else {
        console.log('Too many / Not enough words.');
        msg.channel.send('Please enter the command in this format: \n!serverlist [Region]\nRegion list is: NA or North America, EU or Europe, JP or Japan, OCE or Oceania');
      }
  }
});

// Log into Discord bot.
client.login(process.env.CLIENT_TOKEN);