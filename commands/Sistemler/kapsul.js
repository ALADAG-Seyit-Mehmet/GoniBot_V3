const { SlashCommandBuilder } = require('discord.js');
const db = require('croxydb');
module.exports = {
    data: new SlashCommandBuilder().setName('zaman-kapsulu').setDescription('Geleceğe not.')
        .addStringOption(o=>o.setName('mesaj').setDescription('Notun').setRequired(true))
        .addIntegerOption(o=>o.setName('dakika').setDescription('Kaç dk sonra?').setRequired(true)),
    async execute(i) {
        const id = Date.now();
        db.set(`kapsul_${id}`, { user: i.user.id, channel: i.channel.id, msg: i.options.getString('mesaj'), date: Date.now() + (i.options.getInteger('dakika')*60000) });
        db.push('kapsul_listesi', id);
        i.reply(`✅ Kapsül mühürlendi!`);
    }
};