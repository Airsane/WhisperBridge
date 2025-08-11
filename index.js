// Discord js bot
const pino = require('pino');

const { Client } = require('discord.js-selfbot-v13');
const client = new Client();
const dotenv = require('dotenv');
dotenv.config();

const token = process.env.TOKEN;
const guildId = process.env.GUILD_ID;
const pingedUserId = process.env.PINGED_USER_ID;
const checkStatus = process.env.CHECK_STATUS.toLowerCase() === 'true';
let logger;

client.once('ready', async () => {
    logger.info(`Logged in as ${client.user.tag}`);
    // check user status every 5 minuts
    if(checkStatus){
        setInterval(checkUserStatus, 60 * 1000 * 5);
    }
});

const checkUserStatus = async () =>{
    const guild = client.guilds.cache.get(guildId);
    const user = await guild.members.fetch(pingedUserId);
    const presence = user.presence?.status;
    const currentStatus = client.user.presence?.status;
    logger.info(`Current status: ${currentStatus}, Presence: ${presence}`);
    if(presence === currentStatus) return;
    if(presence === undefined && currentStatus === 'invisible') return;

    if(presence !== undefined){
        client.user.setStatus(presence);
        logger.info('Setting status to ' + presence);
    } else{
        client.user.setStatus('invisible');
        logger.info('Setting status to invisible');
    }
}

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
        logger.info(`Created channel ${channel.name}`);
    }

    logger.info(`Received message from ${message.author.username} in ${channel.name}`);

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

    logger.info(`Sending message to ${user.username}`);

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

const transport = pino.transport({
    targets:[
        {
            target: 'pino-loki',
            options:{
                host: process.env.LOKI_HOST,
                labels:{app: 'whisper-bot', env:"production"},
                batching:true,
                interval: 5,
            }
        },
        {
            target: 'pino-pretty',
            options:{
                colorize: true,
                singleLine: true,
                ignore: 'pid,hostname',
            }
        }
    ]
});
logger = pino(transport);
logger.info('Logger initialized, starting bot login...');
client.login(token);