module.exports = {
    name: "pat",
	description: "Gives you a pat!",
    usage: ``,
    category: `sfw`,
	accessableby: "Members",
    aliases: []
}

module.exports.run = async (bot, msg) => {
    require('./functions/img')('pat', msg);
}
