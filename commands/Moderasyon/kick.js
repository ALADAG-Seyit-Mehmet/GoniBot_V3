const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const db = require('croxydb');

module.exports = {
    data: new SlashCommandBuilder().setName('kick').setDescription('Kullanıcıyı atar.').addUserOption(o=>o.setName('user').setDescription('Kim?').setRequired(true)),
    async execute(i) {
        const modRol = db.fetch(`modRol_${i.guild.id}`);
        const yetkiliMi = i.member.permissions.has(PermissionsBitField.Flags.KickMembers);
        const modMu = modRol ? i.member.roles.cache.has(modRol) : false;

        // --- YETKİ KONTROLÜ ---
        if (!yetkiliMi && !modMu) {
            return i.reply({ 
                content: `⛔ **Yetkin Yok!**\nBu komutu kullanmak için **Moderatör Rolüne** (<@&${modRol}>) veya Kick yetkisine sahip olmalısın.`, 
                ephemeral: true 
            });
        }

        const user = i.options.getMember('user');
        if(user && user.kickable) { 
            await user.kick(); 
            i.reply(`🦶 **${user.user.tag}** sunucudan atıldı.`); 
        } else {
            i.reply({ content: "❌ **Hata:** Bu kişiyi atamam. (Yetkisi benden yüksek)", ephemeral: true });
        }
    }
};