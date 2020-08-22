module.exports = {
    name: 'setconf',
    description: 'Sets the settings for the current server.',
    permissions: ['ADMINISTRATOR'],
    args: 2,
    guildOnly: true,
    usage: '<property> <value>',
    async execute(message, args) {
        if (!message.client.settings.has(message.guild.id, args[0])) {
            return message.reply('this key is not in the configuration.');
        }

        let value;
        let key = args[0];
        const valueChannel = args[1].match(/^<#!?(\d+)>$/);
        const valueUser = args[1].match(/^<@!?(\d+)>$/);
        if (valueChannel) {
            value = valueChannel[1];
        } else if (valueUser) {
            value = valueUser[1];
        } else {
            args.shift();
            value = args.join(' ');
        }

        message.client.settings.set(message.guild.id, value, key);
        message.channel.send(`Guild configuration item ${key} has been changed to:\n\`${value}\``);
    }
}