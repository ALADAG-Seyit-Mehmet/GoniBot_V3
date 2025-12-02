const { AttachmentBuilder } = require('discord.js');
const { Welcomer } = require('canvacord');
const db = require('croxydb');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        const welcomeChannelID = db.fetch(`hosgeldinKanal_${member.guild.id}`);
        if (!welcomeChannelID) return;
        
        try {
            const channel = await member.guild.channels.fetch(welcomeChannelID);
            if (!channel) return;

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
                // SENİN VERDİĞİN LİNK
                .setBackground("https://media.tenor.com/6yWED-oo_sUAAAAd/welcome-anime.gif");

            const buffer = await card.build();
            const attachment = new AttachmentBuilder(buffer, { name: 'welcome.png' });
            
            await channel.send({ content: `${member} aramıza katıldı!`, files: [attachment] });

        } catch (err) {
            console.log("[HATA] Resim oluşturulamadı:", err);
        }
    }
};