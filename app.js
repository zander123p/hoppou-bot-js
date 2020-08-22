const fs = require('fs');
const { readdirSync, statSync } = require('fs');
const { join } = require('path');
const Discord = require('discord.js');
const Enmap = require('enmap');
require('dotenv').config();

const prefix = process.env.PREFIX;

const client = new Discord.Client();
client.commands = new Discord.Collection();

for (const folder of getDirectories('./commands/moduals')) {
    let files = fs.readdirSync(`./commands/moduals/${folder}`).filter(file => file.endsWith('.js'));
    for (const file of files) {
        const command = require(`./commands/moduals/${folder}/${file}`);
        command.category = folder;
        client.commands.set(command.name, command);
    }
}

client.commands.categories = getDirectories('./commands/moduals');

const cooldowns = new Discord.Collection();

client.settings = new Enmap({
    name: 'settings',
    fetchAll: false,
    autoFetch: true,
    cloneLevel: 'deep'
});

client.defaultSettings = {
    prefix: prefix,
    modLogChannel: 'mod-log',
    rulesChannel: 'rules',
    modRole: 'Mod',
    adminRole: 'Admin',
    welcomeChannel: 'welcome',
    welcomeMessage: '**Welcome to the {{guild}},** {{user}}!\nYou are the {{count}} Hoppou of the server!\nPlease check out {{rules}} and enjoy your stay!'
};

client.modActions = new Enmap({
    name: 'actions'
});

client.userProfiles = new Enmap({
    name: 'userProfiles'
});

client.on('guildDelete', guild => {
    client.settings.delete(guild.id);
});

client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Logging

client.on('guildMemberAdd', async member => {
    client.settings.ensure(member.guild.id, client.defaultSettings);
    client.userProfiles.ensure(member.id, {
        id: member.id,
        guild: member.guild.id,
        totalActions: 0,
        warnings: [],
        kicks: []
    });
    let welcomeMessage = client.settings.get(member.guild.id, 'welcomeMessage');
    welcomeMessage = welcomeMessage.replace('{{user}}', member.user);
    let count = member.guild.memberCount;
    if ([0,4,5,6,7,8,9].includes(member.guild.memberCount % 10))
        count+='th';
    else if (member.guild.memberCount % 10 == 1)
        count+='st';
    else if (member.guild.memberCount % 10 == 2)
        count+='nd';
    else if (member.guild.memberCount % 10 == 3)
        count+='rd';
    welcomeMessage = welcomeMessage.replace('{{count}}', count);
    welcomeMessage = welcomeMessage.replace('{{guild}}', member.guild.name);
    welcomeMessage = welcomeMessage.replace('{{rules}}', member.guild.channels.cache.get(client.settings.get(member.guild.id, 'rulesChannel')));
    member.guild.channels.cache
        .get(client.settings.get(member.guild.id, 'welcomeChannel'))
        .send(welcomeMessage)
        .catch(console.error);
});

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
        const channel = client.channels.cache.get(client.settings.get(message.guild.id, 'modLogChannel'));
        channel.send(`${message.author.tag}'s message: \`${message}\` was deleted by ${executor.tag}!`);
        console.log(`${message.author.tag}'s message: \`${message}\` was deleted by ${executor.tag}!`);
    } else {
        const channel = client.channels.cache.get(client.settings.get(message.guild.id, 'modLogChannel'));
        channel.send(`${message.author}'s message: \`${message}\` was deleted!`);
    }
});

// Message/Command handling

client.on('message', async msg => {
    if (msg.author.bot) return;
    let guildConf;
    if (msg.guild) {
        guildConf = client.settings.ensure(msg.guild.id, client.defaultSettings);
        client.userProfiles.ensure(msg.author.id, {
            id: msg.author.id,
            guild: msg.guild.id,
            totalActions: 0,
            warnings: [],
            kicks: []
        });
    } else
        guildConf = client.defaultSettings;

    if (!msg.content.startsWith(guildConf.prefix)) return;

    const args = msg.content.slice(guildConf.prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
    
    if (!command) return msg.reply(`the command '${commandName}' does not exsit. Please make sure you typed it correctly!`);

    if (command.guildOnly && msg.channel.type === 'dm') return msg.reply('I can\'t execute that command inside DMs!');

    if (msg.guild && !msg.guild.member(msg.author).hasPermission(command.permissions)) return msg.reply('you don\'t have the required permissions to run that command!');

    if (command.args && !args.length || args.length < command.args) {
        let reply = (args.length < command.args && args.length != 0)? `you didn't provide enough arguments!` : `you didn't provide any arguments!`;

        if (command.usage) {
            reply += `\nThe proper usage would be: \`${guildConf.prefix}${command.name} ${command.usage}\``;
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

function getDirectories(path) {
    return fs.readdirSync(path).filter(function (file) {
      return fs.statSync(path+'/'+file).isDirectory();
    });
  }

client.login(process.env.TOKEN);