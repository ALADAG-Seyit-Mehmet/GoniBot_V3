const fs = require('fs');
const { REST, Routes } = require('discord.js');

module.exports = (client) => {
    const commands = [];
    fs.readdirSync('./commands/').forEach(dir => {
        const files = fs.readdirSync(`./commands/${dir}/`).filter(file => file.endsWith('.js'));
        for (const file of files) {
            const command = require(`../commands/${dir}/${file}`);
            if (command.data && command.execute) {
                client.commands.set(command.data.name, command);
                commands.push(command.data.toJSON());
            }
        }
    });

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);
    (async () => {
        try {
            console.log('🔄 Komutlar Yükleniyor...');
            await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });
            console.log('✅ Komutlar Hazır!');
        } catch (error) { console.error(error); }
    })();
};