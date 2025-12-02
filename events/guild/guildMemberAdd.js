const { AttachmentBuilder } = require('discord.js');
const { Welcomer } = require('canvacord');
const db = require('croxydb');
const path = require('path');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        const welcomeChannelID = db.fetch(`hosgeldinKanal_${member.guild.id}`);
        if (!welcomeChannelID) return;
        
        try {
            const channel = await member.guild.channels.fetch(welcomeChannelID);
            if (!channel) return;

            // Yerel resim yolunu belirle
            const bgPath = path.join(__dirname, '../../background.png');

            const card = new Welcomer()
                .setUsername(member.user.username)
                .setDiscriminator(false)
                .setMemberCount(member.guild.memberCount)
                .setGuildName(member.guild.name)
                .setAvatar(member.user.displayAvatarURL({ extension: 'png', forceStatic: true }))
                
                // ŞEFFAF AYARLAR
                .setColor("title", "#FF5500")
                .setColor("username-box", "#00000000")
                .setColor("discriminator-box", "#00000000")
                .setColor("message-box", "#00000000")
                .setColor("border", "#FF5500")
                .setColor("avatar", "#FF5500")
                
                .setText("title", "HOŞGELDİN") 
                .setText("message", "AVELLERE KATILDI") 
                .setText("member-count", "- Üye Sayısı: {count} -")
                
                // 🔥 KRİTİK: Yerel Dosya Yolu 🔥
                .setBackground(bgPath);

            const buffer = await card.build();
            const attachment = new AttachmentBuilder(buffer, { name: 'welcome.png' });
            
            await channel.send({ content: `${member} aramıza katıldı!`, files: [attachment] });

        } catch (err) {
            console.log("[HATA] Resim oluşturulamadı:", err);
        }
    }
};