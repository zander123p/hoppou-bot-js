module.exports = {
    name: 'avatar',
    description: 'Displays your profile picture.',
    aliases: ['icon', 'pfp'],
    execute(message, args) {
        if (args[0] === 'foo') {
            return message.reply('bar');
        }

        message.channel.send(`Arguments: ${args}\nArguemtns length: ${args.length}`);
    },
};