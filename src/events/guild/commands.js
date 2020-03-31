module.exports = {
    event: "message"
}

const { RichEmbed, Collection } = require('discord.js');
const leven = require('leven');
const { spawn } = require('child_process');
const CJSON = require('circular-json');
const { JSONfn } = require('jsonfn');

module.exports.call = async (bot, msg) => {
    if(msg.author.bot || msg.channel.type === "dm") return;

    if(msg.system) return;

    if(!msg.content.toLowerCase().startsWith(bot.config.prefix)){
        if(msg.mentions.users.first() ?
        msg.mentions.users.first().tag == bot.user.tag : false){
            let clean = `@${msg.guild.me.nickname ? msg.guild.me.nickname : bot.user.username}`;
            if(msg.cleanContent != clean){
                msg.content = msg.cleanContent.replace(clean, bot.config.prefix).trim();
            }else{
                msg.args = [];
                msg.Args = [];
                let help = "help";
                logger(help,true,msg,bot);
                let helpcmd = bot.commands.get(help);
                run(helpcmd, bot, msg, `${bot.config.prefix}${help}`);
            }
        }
    }

    if(!msg.content.toLowerCase().startsWith(bot.config.prefix)) return;

    let flags = msg.content.toLowerCase().match(/--([a-z]+)/g);
    msg.flags = [];
    if(flags){
        flags.forEach((f,index) => {
            msg.flags[index] = flags[index].slice(2);
        })
    }

    msg.hasFlag = (input) => {
        return msg.flags.includes(input.toLowerCase());
    }
    msg.flag = msg.hasFlag;

    msg.content = msg.content.replace(/(\s?--[a-zA-Z]+\s?)+/g,' ').trim();

    msg.Args = msg.content.split(/\s|\n/g);

    let command = msg.Args[0].toLowerCase();

    while(msg.Args[0] == bot.config.prefix && msg.Args.length > 0){
        let fix = msg.Args[0] + msg.Args[1];
        msg.Args[1] = fix;
        command = fix.toLowerCase();
        msg.Args = msg.Args.slice(1);
    }

    msg.Args = msg.Args.slice(1);

    msg.Args = msg.Args.clean();

    msg.args = msg.Args.toLowerCase();
    msg.ARGS = msg.Args.toUpperCase();

    msg.content = msg.content.slice(bot.config.prefix.length).trim().slice(command.length-bot.config.prefix.length).trim();

    msg.command = command.slice(bot.config.prefix.length);

    msg.links = (msg.content ? msg.content.match(/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/g) : []) || []

    let cmd = bot.commands.get(command.slice(bot.config.prefix.length)) || bot.commands.get(bot.aliases.get(command.slice(bot.config.prefix.length)));

    const execute = async () => {
        if(cmd){
            bot.stats.commandsExecuted++;

            msg.bot = bot;
            bot.cache.msg = msg;

            logger(command.slice(bot.config.prefix.length),true,msg,bot);

            if(!msg.guild.me.permissionsIn(msg.channel).has('SEND_MESSAGES')){
                return
            }

            let owner = false;
            let admin = false;
            let illegal = false;

            if(bot.checkOwner(msg.author.id)){owner = true}
            if(msg.channel.permissionsFor(msg.member).has("ADMINISTRATOR")){admin = true}

            let errorReasons = [];

            function check(adminAllowed, reason){
                if(owner){
                    illegal = true;
                    errorReasons.push(reason.toString());
                    return false;
                }else if(   adminAllowed &&
                            admin &&
                            (category != "owner" &&
                            category != "private" &&
                            category != "custom")
                ){
                    illegal = true;
                    errorReasons.push(reason);
                    return false;
                }else{
                    return true;
                }
            }

            let ownerError    =  "👮‍♂️ You aren't the bot owner.";
            let botPermError  =  "🚫 Bot doesn't have required permissions.";
            let nsfwError     =  "🔞 This command is only allowed in NSFW channels.";
            let imagesError   =  "🎨 This command requires the \`ATTACH FILES\` permission.";
            let userPermError =  "🚷 You don't have the required permissions for that command.";
            let serverError   =  "⛔ This command isn't available on this server.";

            let category = cmd.category;

            if(category == "images"){
                await bot.setLastImageCache(msg);
            }

            if(category == "economy"){
                await bot.economyRead(bot,msg);
            }

            if((category == "owner" || cmd.category === "private") && !owner){
                return msg.channel.send(error(ownerError))
            }

            if(cmd.cmdperms){
                cmd.cmdperms.forEach(perm => {
                    if(!msg.guild.me.hasPermission(perm)){
                        if(check(false, botPermError)){
                            return msg.channel.send(error(`${botPermError}\nMissing permission: \`${perm}\``))
                        }
                    }
                })
            }
            
            if(category == "nsfw" && ((msg.channel.topic ? msg.channel.topic.toLowerCase().includes('[no-nsfw]') : true) || !msg.channel.nsfw)){
                if(check(true, nsfwError)){
                    return msg.channel.send(error(nsfwError))
                }
            }

            if(category == "images" && !msg.channel.permissionsFor(msg.guild.me).has('ATTACH_FILES')){
                if(check(false, imagesError)){
                    return msg.channel.send(error(imagesError))
                }
            }

            if(!(msg.member.hasPermission(["ADMINISTRATOR"]))){ 
                if(cmd.perms){
                    if(!msg.member.hasPermission(cmd.perms)){
                        if(check(false, userPermError)){
                            return msg.channel.send(error(userPermError))
                        }
                    }
                }
            }

            if(cmd.servers){
                if(cmd.servers.indexOf(msg.guild.id.toString()) < 0){
                    if(check(false, serverError)){
                        return msg.channel.send(error(serverError));
                    }
                }
            }

            if(illegal){
                let time = 10;
                msg.channel.send(error(`⚠️ You are doing something that you shouldn't!\n\n${bot.singPlur(errorReasons.length,"Reason",false)}:\n${errorReasons.join("\n")}\n\nThis message and yours with autodestruct in ${time} seconds if you don't confirm.`))
                .then(async ms => {
                    let emote = '✅';
                    await ms.react(emote);
                    const filter = (reaction, user) => (user.id == msg.author.id) && (reaction.emoji.name == emote)
                    let collector =  ms.createReactionCollector(filter, { time: (time*1000), errors: ['time'] })
                    
                    let runned = false;
                    
                    collector.on('collect', async () => {
                        runned = true;
                        collector.stop()
                        ms.delete().catch();
                        return run(cmd, bot, msg, command);
                    })
                    
                    collector.on('end', async () => {
                        if(runned) return;
                        ms.delete().catch();
                        msg.delete().catch();
                    })
                })
            }else{
                await run(cmd, bot, msg, command);
            }

        }else{
            logger(command.slice(bot.config.prefix.length),false,msg, bot);
            
            if(bot.config.reply_unexisting_command){
                await msg.channel.send(error(`🛑 Command \`${command}\` doesn't exist or isn't loaded correctly.`));
            }
        }
    }

    if(!cmd){
        let cmdarray = bot.commands.map(c => c.name).concat(bot.aliases.keyArray());
        let mostlikely = new Collection();
        cmdarray.forEach(item => {
            let numb = leven(msg.command,item);
            mostlikely.set(item,numb);
        })
        mostlikely = mostlikely.sort((a,b) => a-b);
        let items = mostlikely.map((val, key) => key).slice(0,9);
        let string = `Command \`${msg.command}\` is unavailable...\nSend a message with the number of the desidered command.\n\n`;
        items.forEach((val, ind) => {
            string += `${ind+1}) ${val}\n`
        })
        let ms;
        await msg.channel.send(bot.embed().setDescription(string)).then(m => ms = m);
        let filter = m => m.author.id == msg.author.id && m.content.match(/[0-9]/g);
        await msg.channel.awaitMessages(filter, { max: 1, time: 30000, error: ['time'] })
        .then(async (collected) => {
            let m = collected.first();
            let numb = m.content.match(/[1-9]/g)[0];
            let com = items[numb-1];
            msg.command = com;
            cmd = bot.commands.get(com) || bot.commands.get(bot.aliases.get(com));
            await m.delete().catch();
            await ms.delete().catch();
            return await execute();
        })
        .catch(async () => {
            logger(msg.command, false, msg, bot);
            await ms.delete();
            return await execute();
        })
    }else{
        return await execute();
    }
}

async function run(cmd, bot, msg, command){
    spawn('node',[`${__dirname}/child/run.js`, JSON.stringify([cmd,bot,msg,command]) ], {stdio:[process.stdin,process.stdout,process.stderr]});
}

function logger(cmd, actived, msg, bot){
    bot.log(`${cmd.toUpperCase()}: (${actived?"activated":"rejected"}) ${msg.author.tag} (${msg.author.id}, ${msg.channel.id}, ${msg.guild.id})`.cmd)
}

function error(error){
    return new RichEmbed()
    .setTitle('ERROR!')
    .setDescription(error.substr(0,1950))
    .setColor('FF0000')
}
