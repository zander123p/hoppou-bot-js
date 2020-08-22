module.exports = {
    name: 'showwarns',
    description: 'Shows the warnings of the user provided.',
    guildOnly: true,
    permissions: ['KICK_MEMBERS'],
    args: 1,
    usage: '<user>',
    execute(message, args) {
        const target = getUserFromMention(message.client, args[0]);
        const warnIDs = message.client.userProfiles.get(target.id, 'warnings');
        const warnData = warnIDs.map(id => '+' + message.client.modActions.get(id).reason + '\n');
        message.reply(`the user, ${target.username}, has ${warnIDs.length} warnings:\n\`\`\`${warnData}\`\`\``);
    },
};

function getUserFromMention(client, mention) {
    const matches = mention.match(/^<@!?(\d+)>$/);

    if (!matches) return;

    const id = matches[1];

    return client.users.cache.get(id);
}