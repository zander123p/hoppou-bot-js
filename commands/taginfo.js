module.exports = {
    name: 'taginfo',
    description: 'Displays info of the given tag.',
    guildOnly: true,
    args: 1,
    usage: '<tag>',
    async execute(message, args) {
        const tagName = args[0];

        const tag = await message.client.Tags.findOne({ where: { name: tagName } });
        if (tag) {
            return message.channel.send(`${tagName} was created by ${tag.username} at ${tag.createdAt} and has been used ${tag.usage_count} times.`);
        }
        return message.reply(`could not find tag: ${tagName}.`);
    },
};