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

            // İndirdiğimiz temiz arka planın yolu
            const bgPath = path.join(__dirname, '../../clean_bg.png');

            const card = new Welcomer()
                .setUsername(member.user.username)
                .setDiscriminator(' ') // Etiketi kapat
                .setMemberCount(member.guild.memberCount)
                .setGuildName(member.guild.name)
                .setAvatar(member.user.displayAvatarURL({ extension: 'png', forceStatic: true }))
                
                // Şeffaf ve Modern Renkler
                .setColor("title", "#3498db")        // Mavi Başlık
                .setColor("username-box", "transparent")
                .setColor("discriminator-box", "transparent")
                .setColor("message-box", "transparent")
                .setColor("border", "#3498db")       // Mavi Kenarlık
                .setColor("avatar", "#3498db")
                
                .setText("title", "HOŞGELDİN") 
                .setText("message", "SUNUCUYA KATILDI") 
                .setText("member-count", "- Toplam Üye: {count} -")
                
                // YEREL DOSYAYI KULLAN
                .setBackground(bgPath);

            const buffer = await card.build();
            const attachment = new AttachmentBuilder(buffer, { name: 'welcome.png' });
            
            await channel.send({ content: `${member} aramıza katıldı!`, files: [attachment] });

        } catch (err) {
            console.log("[HATA] Resim oluşturulamadı:", err);
        }
    }
};