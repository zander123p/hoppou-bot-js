const Discord = require('discord.js');
module.exports = {
    name: 'help',
    description: 'List all of my commands or info about a specific command.',
    aliases: ['commands'],
    usage: '[command name]',
    cooldown: 5,
    execute(message, args) {
        const data = [];
        const { commands } = message.client;
        let guildConf;
        if (message.guild)
            guildConf = message.client.settings.ensure(message.guild.id, message.client.defaultSettings);
        else
            guildConf = message.client.defaultSettings;
    
        if (!args.length) {
            data.push('Here\'s a list of all my commands:');
            data.push(commands.map(command => '- ' + command.name).join('\n'));
            data.push(`\nYou can send \`${guildConf.prefix}help [command name]\` to get info on a specific command!`);
            let currentCategory = null;
            let currentCategoryIndex = 0;

            if (!currentCategory) {
                currentCategory = commands.categories[currentCategoryIndex];
            }

            const embed = new Discord.MessageEmbed()
                .setColor('#158559')
                .setTitle(`Commands - ${FirstUpperCase(currentCategory)}`);
            
            commands.forEach(cmd => {
                if (cmd.category !== currentCategory) return;
                embed.addField(FirstUpperCase(cmd.name), cmd.description, true);
            });

            const filter = (reaction, user) => {
                return !user.bot;
            };
            
            message.author.send(embed).then(async msg => {
                msg.react('⬅️').then(() => msg.react('➡️'));
                let collector = msg.createReactionCollector(filter, { time: 15000 });
                collector.on('collect', (reaction, user) => {
                    if (reaction.emoji.name === '⬅️') {
                        if (currentCategoryIndex - 1 < 0)
                            currentCategoryIndex = commands.categories.length-1;
                        else
                            currentCategoryIndex--;
                        collector.resetTimer();
                    } else if (reaction.emoji.name === '➡️') {
                        if (currentCategoryIndex + 1 >= commands.categories.length)
                            currentCategoryIndex = 0;
                        else
                            currentCategoryIndex++;
                        collector.resetTimer();
                    }
                    currentCategory = commands.categories[currentCategoryIndex];
    
                    embed.setTitle(`Commands - ${FirstUpperCase(currentCategory)}`);
                    embed.fields = [];
                    commands.forEach(cmd => {
                        if (cmd.category !== currentCategory) return;
                        embed.addField(FirstUpperCase(cmd.name), cmd.description, true);
                    });
        
                    msg.edit(embed);
                });

                collector.on('end', async collected => {
                    const botReact = msg.reactions.cache.filter(reaction => reaction.users.cache.has(msg.author.id))
                    for (const reaction of botReact.values()) {
                        await reaction.users.remove(msg.author.id);
                    }
                });
                if (message.channel.type === 'dm') return;
                message.reply('I\'ve sent you a DM with all my commands!');
            })
            .catch(error => {
                console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
                message.reply('it seems like I can\'t DM you! Do you have DMs disabled?');
                return;
            });

            return;
        }
        const name = args[0].toLowerCase();
        const command = commands.get(name) || commands.find(c => c.aliases && c.aliases.includes(name));

        if (!command) {
            return message.reply('that\'s not a valid command!');
        }

        data.push(`**Name:** ${command.name}`);

        if (command.aliases) data.push(`**Aliases:** ${command.aliases.join(', ')}`);
        if (command.description) data.push(`**Description:** ${command.description}`);
        if (command.usage) data.push(`**Usage:** ${guildConf.prefix}${command.name} ${command.usage}`);

        data.push(`**Cooldown:** ${command.cooldown || 3} second(s)`);


        message.channel.send(data, { split: true });
    },
};

function FirstUpperCase(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}