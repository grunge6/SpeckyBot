module.exports = {
	name: "vc",
	description: "Informations about the vocal channel you're in!",
	usage: ``,
	category: `utilities`,
	accessableby: "Members",
    aliases: ["vocalchannel","vcinfo"]
}

module.exports.run = async (bot, msg) => {
	if(msg.member.voiceChannel){
	let embed = bot.embed()
		.setAuthor(msg.author.username)
		.setDescription("Here are some informations of the vocal channel you're in!")
		.setColor("#694235")
		.addField("Voice channel name", `${msg.member.voiceChannel}`)
		.addField("Voice channel ID", `${msg.member.voiceChannel.id}`)
		.addField("User limit", `${msg.member.voiceChannel.userLimit}`)
		.addField("Link", `https://discordapp.com/channels/${msg.guild.id}/${msg.member.voiceChannel.id}`);
		msg.channel.send(embed);
	}else{
		msg.reply("you aren't in a voice channel")
	}
}
