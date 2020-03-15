module.exports = {
    name: "play",
	description: "Plays a song by choice!",
    usage: `<song>`,
    category: `music`,
	accessableby: "Members",
    aliases: ["p"]
}

module.exports.run = async (bot, msg) => {
    const VC = msg.member.voiceChannel;
    if(!VC) return bot.cmdError("You aren't in a vocal channel.");
    let request = msg.content;
    if(!(request || bot.music.queues.get(msg.guild.id) ? bot.music.queues.get(msg.guild.id).size() : false)) return bot.cmdError("You have to send a link of a name of a song.")
    
    VC.join().then(connection => {
        if(!bot.music.has(VC.id)){
            
        }
    })
    .catch(err => {
        return bot.cmdError("Could not join channel.");
    })
}
