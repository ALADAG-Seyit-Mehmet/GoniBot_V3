const fs = require('fs');
module.exports = (client) => {
    fs.readdirSync('./events/').forEach(dir => {
        const files = fs.readdirSync(`./events/${dir}/`).filter(file => file.endsWith('.js'));
        for (const file of files) {
            const event = require(`../events/${dir}/${file}`);
            if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
            else client.on(event.name, (...args) => event.execute(...args, client));
        }
    });
};