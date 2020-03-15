const { Collection } = require('discord.js')

module.exports = async (bot) => {
    bot.music = new Collection();
}
