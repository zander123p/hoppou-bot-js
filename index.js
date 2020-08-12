const fs = require('fs');
const Discord = require('discord.js');
const Sequelize = require('sequelize');

const prefix = process.env.PREFIX;

const client = new Discord.Client();
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection();

const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

client.Tags = sequelize.define('tags', {
    name: {
        type: Sequelize.STRING,
        unique: true,
    },
    description: Sequelize.TEXT,
    username: Sequelize.STRING,
    usage_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
    },
});

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.Tags.sync();
});

// Logging

client.on('guildMemberAdd', member => {
    
})

client.on('messageDelete', async message => {
    if (!message.guild) return;
    const fetchedLogs = await message.guild.fetchAuditLogs({
        limit: 1,
        type: "MESSAGE_DELETE",
    });

    const deletionLog = fetchedLogs.entries.first();

    if (!deletionLog) return console.log("didn't work");

    const { executor, target } = deletionLog;

    if (target.id === message.author.id) {
        const channel = client.channels.cache.get(logChannel);
        channel.send(`${message.author.tag}'s message: \`${message}\` was deleted by ${executor.tag}!`);
        console.log(`${message.author.tag}'s message: \`${message}\` was deleted by ${executor.tag}!`);
    } else {
        const channel = client.channels.cache.get(logChannel);
        channel.send(`${message.author}'s message: \`${message}\` was deleted!`);
    }
});

// Message/Command handling

client.on('message', async msg => {
    if (!msg.content.startsWith(prefix) || msg.author.bot) return;

    const args = msg.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    
    if (!command) return msg.reply(`the command '${commandName}' does not exsit. Please make sure you typed it correctly!`);

    if (command.guildOnly && msg.channel.type === 'dm') return msg.reply('I can\'t execute that command inside DMs!');

    if (msg.guild && !msg.guild.member(msg.author).hasPermission(command.permissions)) return msg.reply('you don\'t have the required permissions to run that command!');

    if (command.args && !args.length || args.length < command.args) {
        let reply = (args.length < command.args && args.length != 0)? `you didn't provide enough arguments!` : `you didn't provide any arguments!`;

        if (command.usage) {
            reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
        }

        return msg.reply(reply);
    }

    if (!cooldowns.has(command.name)) {
        cooldowns.set(command.name, new Discord.Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = (command.cooldown || 3) * 1000;

    if (timestamps.has(msg.author.id)) {
        const expirationTime = timestamps.get(msg.author.id) + cooldownAmount;

        if (now < expirationTime) {
            const timeLeft = (expirationTime - now) / 1000;
            return msg.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command`)
        }
    }

    timestamps.set(msg.author.id, now);
    setTimeout(() => timestamps.delete(msg.author.id), cooldownAmount);

    try {
        command.execute(msg, args);
    } catch (error) {
        console.error(error);
        msg.reply('there was an error running this command!');
    }
});

function getUserFromMention(mention) {
    const matches = mention.match(/^<@!?(\d+)>$/);

    if (!matches) return;

    const id = matches[1];

    return client.users.cache.get(id);
}

client.login(process.env.TOKEN);