const Helper;

Helper.getUserFromMention = function(client, mention) {
    const matches = mention.match(/^<@!?(\d+)>$/);

    if (!matches) return;

    const id = matches[1];

    return client.users.cache.get(id);
};

module.exports = Helper;