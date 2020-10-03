const Discord = require('discord.js');
const ytdl = require('ytdl-core');


const bot = new Discord.Client();
bot.login(process.env.TOKEN);

const prefix = '!';

bot.on('ready', () => {
    console.log('Bot is online');
});

bot.on('message', async message => {
    if(!message.guild) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const cmd = args.shift();

    if(cmd === 'play') {
        if(message.member.voice.channel) {
            const connection = await message.member.voice.channel.join();
            connection.play(ytdl(`${args[0]}`, {filter: 'audioonly'}));
        } else {
            message.reply('You need to join a voice channel first!');
        }
    }
});