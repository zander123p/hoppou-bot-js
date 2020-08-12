module.exports = {
    name: 'tag',
    description: 'Fetches the given tag.',
    guildOnly: true,
    args: 1,
    usage: '<tag>',
    async execute(message, args) {
        const tagName = args[0];

        const tag = await message.client.Tags.findOne({ where: { name: tagName } });
        if (tag) {
            tag.increment('usage_count');
            return message.channel.send(tag.get('description'));
        }
        return message.reply(`could not find tag: ${tagName}.`);
    },
};