const { AttachmentBuilder } = require('discord.js');
const { Welcomer } = require('canvacord');
const db = require('croxydb');

module.exports = {
    name: 'guildMemberAdd',
    async execute(member) {
        // 1. Kanal Ayarlı mı?
        const welcomeChannelID = db.fetch(`hosgeldinKanal_${member.guild.id}`);
        if (!welcomeChannelID) return;
        
        const channel = member.guild.channels.cache.get(welcomeChannelID);
        if (!channel) return;

        // 2. Görsel Tasarım (ProBot Tarzı)
        // Arka planı koyu ve turuncu şeritli bir görsel yapıyoruz
        const card = new Welcomer()
            .setUsername(member.user.username)
            .setDiscriminator(member.user.discriminator === '0' ? ' ' : member.user.discriminator)
            .setMemberCount(member.guild.memberCount)
            .setGuildName(member.guild.name)
            .setAvatar(member.user.displayAvatarURL({ extension: 'png', forceStatic: true }))
            
            // RENK AYARLARI (Karanlık Tema)
            .setColor("title", "#ffffff")       // Başlık Rengi (Beyaz)
            .setColor("username-box", "transparent") // Kutu arkası şeffaf olsun (Daha modern)
            .setColor("discriminator-box", "transparent")
            .setColor("message-box", "transparent")
            .setColor("border", "#ff5500")      // Avatar kenarlığı (Turuncu)
            .setColor("avatar", "#ff5500")      // Avatar arkası
            
            // METİN AYARLARI
            .setText("title", "HOŞ GELDİN")
            .setText("message", `${member.guild.name} Suncusuna!`)
            
            // ARKA PLAN (Karanlık Soyut)
            // Buraya senin attığın resme benzeyen koyu/turuncu bir wallpaper koydum.
            .setBackground("https://wallpapers.com/images/featured/dark-orange-background-309k975769784k30.jpg");

        // 3. Mesajı ve Resmi Gönder
        card.build().then(buffer => {
            const attachment = new AttachmentBuilder(buffer, { name: 'welcome.png' });
            
            // Senin istediğin yazı formatı:
            const mesajMetni = `${member} **${member.guild.name}** sunucusuna katıldı! Toplam üye sayısı **${member.guild.memberCount}** oldu. 🚀`;

            channel.send({ content: mesajMetni, files: [attachment] });
        });

        // 4. Otorol Varsa Ver (Ekstra)
        // const otorolID = db.fetch(`otorol_${member.guild.id}`);
        // if(otorolID) member.roles.add(otorolID).catch(()=>{});
    }
};