module.exports = {
    name: "hwjs",
    description: "Hello World!",
    usage: '',
    category: 'helloworld',
    accessableby: "Members",
    aliases: [],
    run: async (bot, msg) => {
        msg.channel.send("`JavaScript`: Hello World!");
    }
}
