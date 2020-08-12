module.exports = {
    name: 'showtags',
    description: 'Lists all tags.',
    guildOnly: true,
    async execute(message, args) {
        const tagList = await message.client.Tags.findAll({ attributes: ['name'] });
        const tagString = tagList.map(t => t.name).join(', ') || 'No tags set.';
        return message.channel.send(`List of tags: ${tagString}`);
    },
};