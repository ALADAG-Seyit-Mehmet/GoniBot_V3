const { SlashCommandBuilder } = require('discord.js');
const db = require('croxydb');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('afk')
        .setDescription('AFK moduna geçersin.')
        .addStringOption(o => o.setName('sebep').setDescription('Neden gidiyorsun?')),

    async execute(interaction) {
        const sebep = interaction.options.getString('sebep') || "Sebep belirtilmedi.";
        db.set(`afk_${interaction.user.id}`, { sebep: sebep, zaman: Date.now() });
        
        // Kullanıcının ismini değiştir (Opsiyonel - Yetki varsa)
        // try { interaction.member.setNickname(`[AFK] ${interaction.user.username}`); } catch(e){}

        interaction.reply(`💤 **AFK Oldun!**\nSebep: ${sebep}\n*Bir şey yazdığında moddan çıkacaksın.*`);
    }
};