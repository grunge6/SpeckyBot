function errdesc(err){
    try{
        err = err.stack ? err.stack.substr(0,1950) : err.substr(0,1950);
    }catch(e){
        err = null;
    }
    return new RichEmbed()
    .setTitle('ERROR DESCRIPTION')
    .setDescription(`${err}\n\nFile: ${err ? err.fileName : undefined}\nLine: ${err ? err.lineNumber : undefined}`)
    .setColor('FF0000')
}

function error(error){
    return new RichEmbed()
    .setTitle('ERROR!')
    .setDescription(error.substr(0,1950))
    .setColor('FF0000')
}

(async () => {
    let {cmd,bot,msg,command,run,send} = parse(process.argv[2]);
    console.log(msg.channel.send)// = send;
    await run(bot, msg)
    .catch(async (err) => {
        let expected;
        try{
            expected = err.includes("[EXPECTED]")
        }catch(e){expected = false}

        if(expected){
            err = err.replace("[EXPECTED]","").trim();
            await msg.channel.send(error(err));
        }else{
            //bot.log(err.error);
            await msg.channel.send(error(`🚸 An unexpected error happend at \`${command}\` command.\nIf this error happens frequently, report it to the SpeckyBot creators.`));
            
            if(String(err).includes("Must be 2000 or fewer in length")){
                await msg.channel.send(errdesc(`${bot.user} tried to send a message with 2000 or more characters.`));
            }else if(String(err).includes("Request entity too large")){
                await msg.channel.send(errdesc(`${bot.user} tried to send an attachment with more than 8MB.`));
            }else{
                await msg.channel.send(errdesc(err));
            }
        }
    })
    .finally(async () => {
        if(cmd.category == "economy"){
            await bot.economyWrite(bot.economy);
        }
    })
})();
