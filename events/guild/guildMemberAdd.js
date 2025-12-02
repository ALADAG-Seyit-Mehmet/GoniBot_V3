const { AttachmentBuilder, PermissionsBitField } = require('discord.js');
const { Welcomer } = require('canvacord');
const db = require('croxydb');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        console.log(`[OLAY] 🟢 Biri girdi: ${member.user.tag}`); // Bu satır konsolda çıkmıyorsa sorun Developer Portal'dadır.

        const welcomeChannelID = db.fetch(`hosgeldinKanal_${member.guild.id}`);
        if (!welcomeChannelID) return console.log("[HATA] DB'de kanal yok.");
        
        try {
            const channel = await member.guild.channels.fetch(welcomeChannelID);
            if (!channel) return console.log("[HATA] Kanal yok.");

            const card = new Welcomer()
                .setUsername(member.user.username)
                .setDiscriminator(member.user.discriminator === '0' ? ' ' : member.user.discriminator)
                .setMemberCount(member.guild.memberCount)
                .setGuildName(member.guild.name)
                .setAvatar(member.user.displayAvatarURL({ extension: 'png', forceStatic: true }))
                .setColor("title", "#ffffff")
                .setColor("username-box", "transparent")
                .setColor("discriminator-box", "transparent")
                .setColor("message-box", "transparent")
                .setColor("border", "#ff5500")
                .setColor("avatar", "#ff5500")
                .setText("title", "HOŞ GELDİN")
                .setText("message", "Sunucumuza!")
                .setBackground("https://wallpapers.com/images/featured/dark-orange-background-309k975769784k30.jpg");

            const buffer = await card.build();
            const attachment = new AttachmentBuilder(buffer, { name: 'welcome.png' });
            
            await channel.send({ content: `${member} aramıza katıldı!`, files: [attachment] });
            console.log("[BAŞARILI] Resim atıldı.");

        } catch (err) {
            console.log("[HATA]", err);
        }
    }
};