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

            // v5 Uyumlu Güvenli Ayarlar
            const card = new Welcomer()
                .setUsername(member.user.username)
                .setDiscriminator(member.user.discriminator === '0' ? ' ' : member.user.discriminator)
                .setMemberCount(member.guild.memberCount)
                .setGuildName(member.guild.name)
                .setAvatar(member.user.displayAvatarURL({ extension: 'png', forceStatic: true }))
                
                // STANDART RENKLER (Çökmemesi için)
                .setColor("title", "#FF5500") 
                .setColor("username-box", "#000000") // Siyah Kutu (Şimdilik)
                .setColor("discriminator-box", "#000000")
                .setColor("message-box", "#000000")
                .setColor("border", "#FF5500")
                .setColor("avatar", "#FF5500")
                
                .setText("title", "HOŞGELDİN")
                .setText("message", "SUNUCUYA KATILDI")
                .setText("member-count", "- Üye Sayısı: {count} -")
                
                .setBackground("https://wallpapers.com/images/hd/black-and-orange-background-1920-x-1080-4i32732950669273.jpg");

            const buffer = await card.build();
            const attachment = new AttachmentBuilder(buffer, { name: 'welcome.png' });
            
            await channel.send({ content: `${member} aramıza katıldı!`, files: [attachment] });

        } catch (err) {
            console.log("[HATA] Resim hatası:", err);
        }
    }
};