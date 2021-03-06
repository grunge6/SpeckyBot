module.exports = {
    name: "bump",
	description: "Bumps the server!",
    usage: ``,
    category: `custom`,
	accessableby: "Members",
    aliases: [],
    servers: ['265505748413448193','525114151077675039']
}

const { RichEmbed } = require("discord.js");
const { randomInt } = require('mathjs');

module.exports.run = async (bot, msg) => {
    var random;
    if(bot.checkOwner(msg.author.id)){
        random = randomInt(1,10000)
    }else{
        random = randomInt(1,450)
    }
    let cEmbed = new RichEmbed()
    .setColor('#24B8B8')
    .setURL('https://disboard.org/server/265505748413448193')
    .setTitle(`**DISBOARD: The Public Server List**`)
    .setDescription(`<@${msg.author.id}>,\nBump succeeded :thumbsup:\nYou are now bump level ${random}!`)
    .setImage('https://cdn.discordapp.com/attachments/555484681135587338/599982089089187870/bot-command-image-bump.png')

    msg.channel.send(cEmbed);
}
