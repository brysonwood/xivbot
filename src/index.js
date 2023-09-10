require('dotenv').config();
const {Client, GatewayIntentBits, EmbedBuilder, PermissionsBitField, Permissions, messageLink} = require('discord.js');
const client = new Client({intents: [
  GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent
]});

const prefix = '!';


client.on("ready", () => {
  console.log("Bot is ready!");
  client.user.setActivity(`Hello.`);
});

client.on("messageCreate", msg  => {
  if (!msg.content.startsWith(prefix) || msg.author.bot) return;
    
  const args = msg.content.slice(prefix.length).split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'ping') {
    msg.channel.send('pong!');
  }

  console.log("Message received.");
});

client.login(process.env.CLIENT_TOKEN);