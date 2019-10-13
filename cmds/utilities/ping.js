module.exports.run = async (bot, msg, args, owner, prefix) => {
    msg.channel.send('Pinging...').then(m =>{
        let ping = m.createdTimestamp - msg.createdTimestamp;
        m.edit(`Bot Latency: \`${ping}ms\`\nAPI Latency: \`${Math.round(bot.ping)}ms\``)
    });
}

module.exports.config = {
    name: "ping",
	description: "Information about how fast the bot is!",
	usage: ``,
	accessableby: "Members",
    aliases: ["pong", "pin", "pon"]
}