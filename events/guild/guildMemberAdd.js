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
                
                // RENKLER (Turuncu/Koyu Tema)
                .setColor("title", "#FF5500")
                .setColor("username-box", "#00000000") // Şeffaf Kutu
                .setColor("discriminator-box", "#00000000")
                .setColor("message-box", "#00000000")
                .setColor("border", "#FF5500")
                .setColor("avatar", "#FF5500")
                
                .setText("title", "HOŞGELDİN") 
                .setText("message", "SUNUCUYA KATILDI") 
                .setText("member-count", "- Toplam Üye: {count} -")
                
                // 🔥 KRİTİK DEĞİŞİKLİK: Link yerine Renk Kodu 🔥
                // Bu koyu gri bir renktir. Bot bunu kendi boyar, internet gerekmez.
                .setBackground("#2C2F33"); 

            const buffer = await card.build();
            const attachment = new AttachmentBuilder(buffer, { name: 'welcome.png' });
            
            await channel.send({ content: `${member} aramıza katıldı!`, files: [attachment] });

        } catch (err) {
            console.log("[HATA] Resim oluşturulamadı:", err);
        }
    }
};