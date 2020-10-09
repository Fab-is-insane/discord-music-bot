const { Client, MessageEmbed } = require('discord.js');
const mongoose = require('mongoose');
const ytdl = require('ytdl-core');
const User = require('./schemas/user');


const databaseURI = 'mongodb+srv://bot:tiDBpass@123@database-cluster.lkrli.mongodb.net/discord_bot_database?retryWrites=true&w=majority';

mongoose.connect(databaseURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(result => console.log('connected to database'))
    .catch(err => console.log(err));


const bot = new Client();
bot.login(process.env.TOKEN);

const prefix = '!';
let dispatcher = null;

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
            dispatcher = connection.play(thisStream);

            dispatcher.on('finish', () => {
                voiceChannel.leave();
                dispatcher = null;
                message.reply('ooo boi, that was fun!')
                .catch(err => console.log(err));
            });

        } else {
            message.reply('you need to join a voice channel first!')
            .catch(err => console.log(err));
        }
    }

    if(cmd === 'pause') {
        if(dispatcher) {
            dispatcher.pause();
        }
        else {
            message.reply('sorry I cannot pause **silence**.')
            .catch(err => console.log(err));
        }
    }

    if(cmd === 'resume') {
        if(dispatcher) {
            dispatcher.resume();
        }
        else {
            message.reply('there is nothing to resume. Use `!play <link>` cmd to play some music.')
            .catch(err => console.log(err));
        }
    }

    if (cmd === 'help') {
        if (!args.length) {
            const infoEmbed = new MessageEmbed()
            .setColor('#B266B2')
            .setTitle('Commands you can use: ')
            .setDescription('```!help``` - Returns the list of available commands\n```!play <link>``` - Plays the audio of the provided YouTube link\n```!pause``` - Pauses the music\n```!resume``` - Resumes the music\n```!create``` - Creates a profile for the user\n```!me``` - Returns information about the user');
            message.channel.send(infoEmbed);
        }
        else {
            return message.reply('I have no idea what that means.')
            .catch(err => console.log(err));
        }
    }

    if(cmd === 'create') {
        User.findOne({id: message.author.id}, (err, doc) => {
            if(err) {
                console.log(err);
            }
            //  Create a new user doc if it does not exist
            else if(!doc)
            {
                const newUser = new User({
                    username: message.author.username,
                    id: message.author.id,
                });
                newUser.save()
                .catch(err => console.log(err));
                message.reply('woohoo!🥳 use `!me` to check out your brand new shiny✨ profile.')
                .catch(err => console.log(err));
            }
            else {
                message.reply('you already have a profile, use `!me` to check it out.')
                .catch(err => console.log(err));
            }
        })
    }

    if(cmd === 'me') {
        User.findOne({id: message.author.id}, (err, doc) => {
            if(err) {
                console.log(err);
            }
            else if(doc) {
                let prisonStatus = null;
                if(doc.prison.inPrison) {
                    prisonStatus = 'In prison'
                }
                else {
                    prisonStatus = 'Free'
                }
                const userEmbed = new MessageEmbed()
                .setColor('#B266B2')
                .setDescription(
                    `Username: ${doc.username}\nRank: ${doc.rank}\nBalance: ₹ ${doc.balance}\nStatus: ${prisonStatus}\nLevel: ${doc.level}\nTotal XP: ${doc.totalXp}`
                );
                message.channel.send(userEmbed)
                .catch(err => console.log(err));
            }
            else {
                message.reply('you have not created a profile yet. Use `!create` to make a profile.')
                .catch(err => console.log(err));
            }
        });
    }
});