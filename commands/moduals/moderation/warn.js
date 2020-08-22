module.exports = {
    name: 'warn',
    description: 'Warns the user provided.',
    guildOnly: true,
    permissions: ['KICK_MEMBERS'],
    args: 2,
    usage: '<user> <reason>',
    execute(message, args) {
        const target = message.getUserFromMention(args[0]);
        const reason = args.slice(1).join(' ');
        const newActionId = message.client.modActions.autonum;
        message.client.userProfiles.ensure(target.id, {
            id: target.id,
            guild: message.guild.id,
            totalActions: 0,
            warnings: [],
            kicks: []
        });
        message.client.modActions.set(newActionId, {
            user: target.id,
            guild: message.guild.id,
            type: 'warning',
            moderator: message.author.id,
            reason: reason,
            when: Date.now()
        });
        message.client.userProfiles.push(target.id, newActionId, 'warnings');
        message.client.userProfiles.inc(target.id, 'totalActions');
        target.send(`You have been warned by ${message.author} for ${reason}!`);
        message.channel.send(`${target} was warned for \'${reason}\'`);
    },
};