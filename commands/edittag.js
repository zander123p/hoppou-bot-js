module.exports = {
    name: 'edittag',
    description: 'Edits the given tag.',
    guildOnly: true,
    args: 2,
    usage: '<tag> <new description>',
    async execute(message, args) {
        const tagName = args.shift();
        const tagDescription = args.join(' ');

        const affectedRows = await message.client.Tags.update({ description: tagDescription }, { where: { name: tagName } });
        if (affectedRows > 0) {
            return message.channel.reply(`tag: ${tagName}, was edited.`);
        }
        return message.reply(`could not find tag: ${tagName}.`);
    },
};