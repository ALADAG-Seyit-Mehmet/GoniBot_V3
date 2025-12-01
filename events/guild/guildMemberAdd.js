const { AttachmentBuilder } = require('discord.js');
const { Welcomer } = require('canvacord');
const db = require('croxydb');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        // Yeni Ayarlanan Kanalı Çek
        const welcomeChannelID = db.fetch(`hosgeldinKanal_${member.guild.id}`);
        if (!welcomeChannelID) return; // Ayarlı değilse atma
        
        const channel = member.guild.channels.cache.get(welcomeChannelID);
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
            .setBackground("https://images.wallpapersden.com/image/download/abstract-shapes-dark-4k_bGdma2uUmZqaraWkpJRmbmdlrWZlbWY.jpg");

        card.build().then(buffer => {
            const attachment = new AttachmentBuilder(buffer, { name: 'welcome.png' });
            channel.send({ content: `👋 Hoş geldin ${member}!`, files: [attachment] });
        });
    }
};