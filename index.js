const { Client, MessageEmbed } = require('discord.js');
const ytdl = require('ytdl-core');


const bot = new Client();
bot.login(process.env.TOKEN);

const prefix = '!';

bot.on('ready', () => {
    console.log('Bot is online');
});

bot.on('message', async message => {
    if(!message.guild || !message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const cmd = args.shift();

    if(cmd === 'play') {
        if(message.member.voice.channel) {
            let videoURL = args[0];
            const voiceChannel = message.member.voice.channel;

            const connection = await voiceChannel.join();

            const info = await ytdl.getInfo(videoURL);
            const title = info.videoDetails.title;
            message.channel.send(`Now playing **${title}**`);

            const thisStream = ytdl(videoURL, { highWaterMark: 2 ** 25, filter: () => ["251"] });
            const dispatcher = connection.play(thisStream);

            dispatcher.on('finish', () => {
                voiceChannel.leave();
                message.reply('ooo boi, that was fun!');
            });

        } else {
            message.reply('You need to join a voice channel first!');
        }
    }

    if (cmd === 'help') {
        if (!args.length) {
            const infoEmbed = new MessageEmbed()
            .setColor('#B266B2')
            .setTitle('Commands you can use: ')
            .setDescription('```!help``` - Returns the list of available commands\n```!play <link>``` - Plays the audio of the provided YouTube link');
            return message.channel.send(infoEmbed);
        }
        else {
            return message.reply('I have no idea what that means.');
        }
    }
});