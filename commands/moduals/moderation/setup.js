module.exports = {
    name: 'setup',
    description: 'Used to setup the server for basic operation.',
    permissions: ['ADMINISTRATOR'],
    guildOnly: true,
    async execute(message, args) {
        const filter = m => m.channel == message.channel && !m.author.bot;
        const collector = message.channel.createMessageCollector(filter, { time: 80000 });
        message.channel.send('Please supply a channel for logs to go.');
        let stage = 1;

        let valueChannel;
        collector.on('collect', m => {
            switch (stage) {
                case 1:
                    valueChannel = m.content.match(/^<#!?(\d+)>$/);
                    if (valueChannel) {
                        message.client.settings.set(message.guild.id, valueChannel[1], 'modLogChannel');
                        stage++;
                        collector.resetTimer();
                        message.channel.send('Please supply a channel for welcome messages to go.');
                    }
                    break;
                case 2:
                    valueChannel = m.content.match(/^<#!?(\d+)>$/);
                    if (valueChannel) {
                        message.client.settings.set(message.guild.id, valueChannel[1], 'welcomeChannel');
                        stage++;
                        collector.resetTimer();
                        message.channel.send(`Please supply a welcome message.\nYou can use \'{{user}}\' in place of the user, \'{{guild}}\' in place of your guild/server name, \'{{count}}\' in place of the member count (includes \'th\', \'st\', \'rd\', \'nd\') and \'{{rules}}\' in place of a rules channel.\nTo use the default welcome message:\n\'${message.client.defaultSettings.welcomeMessage}\',\ntype: \'-\'`);
                    }
                    break;
                case 3:
                    message.client.settings.set(message.guild.id, (m.content.includes('-'))? message.client.defaultSettings.welcomeMessage : m.content, 'welcomeMessage');
                    stage++;
                    collector.resetTimer();
                    message.channel.send('Please supply a prefix to use.\nDefault prefix is \'p!\', type: \'-\' to use it.');
                    break;
                case 4:
                    message.client.settings.set(message.guild.id, (m.content.includes('-'))? 'p!' : m.content, 'prefix');
                    stage++;
                    collector.stop('done');
                    break;
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason === 'done')
                message.channel.send('Setup complete!\nYou can always re-run the command to change values or use the command `setconf <property> <value>`!');
            else
                message.channel.send('Time ran out, please re-run the command to continue.');
        });
    }
}