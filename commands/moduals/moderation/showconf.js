module.exports = {
    name: 'showconf',
    description: 'Shows the settings for the current server.',
    permissions: ['ADMINISTRATOR'],
    guildOnly: true,
    async execute(message, args) {
        let guildConf = message.client.settings.ensure(message.guild.id, message.client.defaultSettings);

        let configProps = Object.keys(guildConf).map(prop => {
            return `${prop}  :  ${guildConf[prop]}`;
        });
        message.channel.send(`The following are the server's current configuration: \`\`\`${configProps.join('\n')}\`\`\``);
    }
}