const { AttachmentBuilder } = require('discord.js');
const { Welcomer } = require('canvacord');
const db = require('croxydb');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        // Log Kanalını Bul
        const logChannelID = db.fetch(`logKanal_${member.guild.id}`);
        if (!logChannelID) return;
        
        const channel = member.guild.channels.cache.get(logChannelID);
        if (!channel) return;

        // Resmi Oluştur
        const card = new Welcomer()
            .setUsername(member.user.username)
            .setDiscriminator(member.user.discriminator === '0' ? ' ' : member.user.discriminator)
            .setMemberCount(member.guild.memberCount)
            .setGuildName(member.guild.name)
            .setAvatar(member.user.displayAvatarURL({ extension: 'png', forceStatic: true }))
            .setColor("title", "#ffffff")
            .setColor("username-box", "#ff0000")
            .setColor("discriminator-box", "#ff0000")
            .setColor("message-box", "#000000")
            .setColor("border", "#ffffff")
            .setColor("avatar", "#ffffff")
            .setBackground("https://images.wallpapersden.com/image/download/abstract-shapes-dark-4k_bGdma2uUmZqaraWkpJRmbmdlrWZlbWY.jpg"); // Arkaplan

        card.build().then(buffer => {
            const attachment = new AttachmentBuilder(buffer, { name: 'welcome.png' });
            channel.send({ content: `👋 Hoş geldin ${member}!`, files: [attachment] });
        });

        // Otorol varsa ver
        // const otorol = db.fetch(`otorol_${member.guild.id}`);
        // if(otorol) member.roles.add(otorol).catch(()=>{});
    }
};