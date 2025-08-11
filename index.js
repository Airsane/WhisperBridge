// Discord js bot

const { Client } = require('discord.js-selfbot-v13');
const client = new Client();
const dotenv = require('dotenv');
dotenv.config();

const token = process.env.TOKEN;
const guildId = process.env.GUILD_ID;
const pingedUserId = process.env.PINGED_USER_ID;

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
});


const handleIncomingMessage = async (message) => {
    if (message.author.bot) return;
    if (message.guildId !== null) return;
    if (message.author.id === client.user.id) return;
    
    const guild = client.guilds.cache.get(guildId);
    let channel = guild.channels.cache.find(channel => channel.name === message.author.id);
    if (!channel) {
        // The .create() method expects (name, options), not a single object
        channel = await guild.channels.create(
            message.author.id,
            { type: 'GUILD_TEXT' }
        );
        console.log(`Created channel ${channel.name}`);
    }

    channel.send(`<@${pingedUserId}> ${message.author.username}: ${message.content}`);
}

const handleOutgoingMessage = async (message) => {
    if (message.author.bot) return;
    if (message.author.id === client.user.id) return;
    if(message.guildId !== guildId) return;

    const userId = message.channel.name;
    const user = client.users.cache.get(userId);
    if(!user) return;

    user.send(message.content);
}


client.on('message', async (message) => {
    handleIncomingMessage(message);
    handleOutgoingMessage(message);
});

client.login(token);