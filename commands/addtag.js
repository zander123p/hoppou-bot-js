module.exports = {
    name: 'addtag',
    description: 'Adds a tag.',
    guildOnly: true,
    permissions: ['MANAGE_ROLES'],
    args: 2,
    usage: '<tag name> <tag description>',
    async execute(message, args) {
        const tagName = args.shift();
        const tagDescription = args.join(' ');

        try {
            const tag = await message.client.Tags.create({
                name: tagName,
                description: tagDescription,
                username: message.author.username,
            });
            return message.reply(`tag ${tag.name} added.`);
        } catch (error) {
            if (error.name === 'SequelizeUniqueConstraintError') {
                return message.reply('that tag already exists.');
            }
            return message.reply('something went wrong when adding the tag.');
        }
    },
};

function getUserFromMention(mention) {
    const matches = mention.match(/^<@!?(\d+)>$/);

    if (!matches) return;

    const id = matches[1];

    return client.users.cache.get(id);
}