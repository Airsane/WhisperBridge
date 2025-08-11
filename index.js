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
        channel = await guild.channels.create(
            message.author.id,
            { type: 'GUILD_TEXT' }
        );
        console.log(`Created channel ${channel.name}`);
    }

    // Prepare message options
    let content = `<@${pingedUserId}> ${message.author.username}:`;
    if (message.content && message.content.trim() !== '') {
        content += ` ${message.content}`;
    }

    let options = {};
    if (message.attachments && message.attachments.size > 0) {
        options.files = Array.from(message.attachments.values()).map(att => att.url);
    }

    // Send message with content and/or attachments
    if ((content.trim() !== `<@${pingedUserId}> ${message.author.username}:`) || (options.files && options.files.length > 0)) {
        channel.send({ content: content, files: options.files });
    }
}


const handleOutgoingMessage = async (message) => {
    if (message.author.bot) return;
    if (message.author.id === client.user.id) return;
    if (message.guildId !== guildId) return;

    const userId = message.channel.name;
    const user = client.users.cache.get(userId);
    if (!user) return;

    // Prepare message options
    let options = {};
    if (message.attachments && message.attachments.size > 0) {
        options.files = Array.from(message.attachments.values()).map(att => att.url);
    }

    // If message has content or attachments, send accordingly
    if ((message.content && message.content.trim() !== '') || (options.files && options.files.length > 0)) {
        user.send({ content: message.content || undefined, files: options.files });
    }
}


client.on('message', async (message) => {
    handleIncomingMessage(message);
    handleOutgoingMessage(message);
});

client.login(token);