const { SlashCommandBuilder } = require('discord.js');
const db = require('croxydb');
module.exports = {
    data: new SlashCommandBuilder().setName('isgal').setDescription('Kanalı işgal et.'),
    async execute(i) {
        const klan = db.fetch(`klan_${i.user.id}`);
        if(!klan) return i.reply("Klanın yok.");
        if(Math.random() > 0.5) {
            db.set(`kanalSahibi_${i.channel.id}`, klan);
            i.reply(`🏴‍☠️ Burası artık **${klan}** hakimiyetinde!`);
        } else i.reply("⚔️ Saldırı başarısız.");
    }
};