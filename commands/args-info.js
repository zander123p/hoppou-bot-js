module.exports = {
    name: 'args-info',
    description: 'Information about the arguments provided.',
    args: true,
    execute(message, args) {
        if (args[0] === 'foo') {
            return message.reply('bar');
        }

        message.channel.send(`Arguments: ${args}\nArguemtns length: ${args.length}`);
    },
};