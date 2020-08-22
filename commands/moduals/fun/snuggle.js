const https = require('https');
const Discord = require('discord.js');
module.exports = {
    name: 'snuggle',
    description: 'Give someone a snuggle.',
    args: 1,
    guildOnly: true,
    usage: '<user>',
    execute(message, args) {
        https.get(`https://api.tenor.com/v1/search?q=anime+snuggle&key=${process.env.APIKEY}&limit=25`, (resp) => {
            let data = '';

            resp.on('data', (chunk) => {
                data += chunk;
            });

            resp.on('end', () => {
                const msg = new Discord.MessageEmbed()
                    .setColor('#158559')
                    .setTitle(`${message.author.username} gave ${getUserFromMention(message.client, args[0]).username} a snuggle!`)
                    .setImage(JSON.parse(data).results[Math.floor(Math.random() * Object.keys(JSON.parse(data).results).length)].media[0].gif.url);
                message.channel.send(msg);
            });
        });
    },
};
function getUserFromMention(client, mention) {
    const matches = mention.match(/^<@!?(\d+)>$/);

    if (!matches) return;

    const id = matches[1];

    return client.users.cache.get(id);
}