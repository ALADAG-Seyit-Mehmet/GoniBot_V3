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
                
                // --- RENK AYARLARI (Temiz Görünüm) ---
                .setColor("title", "#FF5500")        // Başlık (HOŞGELDİN) Turuncu
                .setColor("username-box", "transparent") // Kutu YOK
                .setColor("discriminator-box", "transparent")
                .setColor("message-box", "transparent") // Kutu YOK
                .setColor("border", "#FF5500")       // Avatar Kenarlığı Turuncu
                .setColor("avatar", "#FF5500")
                
                // --- YAZI AYARLARI ---
                .setText("title", "HOŞGELDİN") 
                .setText("message", "AVELLERE KATILDI") 
                .setText("member-count", "- Toplam Üye: {count} -")
                
                // --- ARKA PLAN (Koyu Turuncu/Siyah) ---
                .setBackground("https://wallpapers.com/images/hd/black-and-orange-background-1920-x-1080-4i32732950669273.jpg");

            const buffer = await card.build();
            const attachment = new AttachmentBuilder(buffer, { name: 'welcome.png' });
            
            // Mesaj içeriği
            await channel.send({ content: `${member} aramıza katıldı!`, files: [attachment] });

        } catch (err) {
            console.log("[HATA] Resim oluşturulamadı:", err);
        }
    }
};