const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');
const db = require('croxydb');

module.exports = {
    data: new SlashCommandBuilder().setName('ban').setDescription('Kullanıcıyı yasaklar.').addUserOption(o=>o.setName('user').setDescription('Kim?').setRequired(true)),
    async execute(i) {
        const modRol = db.fetch(`modRol_${i.guild.id}`);
        const yetkiliMi = i.member.permissions.has(PermissionsBitField.Flags.BanMembers);
        const modMu = modRol ? i.member.roles.cache.has(modRol) : false;

        if(!yetkiliMi && !modMu) return i.reply({content: "❌ Yetkin veya Mod rolün yok.", ephemeral: true});

        const user = i.options.getUser('user');
        try { 
            await i.guild.members.ban(user); 
            i.reply(`🔨 **${user.tag}** yasaklandı.`); 
        } catch(e){ i.reply("Yetkim yetmedi veya bu kişiyi banlayamam."); }
    }
};