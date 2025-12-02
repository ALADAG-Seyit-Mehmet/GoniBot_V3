const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('croxydb');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('reenkarne')
        .setDescription('Mevcut hayatını sonlandır ve daha güçlü yeniden doğ.'),

    async execute(interaction) {
        // Verileri Çek
        const user = interaction.user;
        const guild = interaction.guild;
        const reenkSayisi = db.fetch(`reenkarnasyon_${user.id}`) || 0;
        
        // Level Verisini Kontrol Et (XP sistemine göre level hesabı gerekebilir ama biz DB'de level tutuyorsak onu çekeriz)
        // Eğer DB'de direkt level tutmuyorsak (sadece XP tutuyorsak), leveli hesaplayalım:
        // (Bu örnekte DB'de 'lvl_' anahtarı olduğunu varsayıyoruz, messageCreate.js'de ayarlamıştık)
        const currentLvl = db.fetch(`lvl_${user.id}`) || 0;

        // --- ZORLUK FORMÜLÜ ---
        // 0. Reenkarnasyon -> Hedef 10 Level
        // 1. Reenkarnasyon -> Hedef 25 Level
        // 2. Reenkarnasyon -> Hedef 40 Level
        const gerekenLevel = 10 + (reenkSayisi * 15);

        // KONTROL
        if (currentLvl < gerekenLevel) {
            return interaction.reply({ 
                content: `🚫 **Henüz Hazır Değilsin!**\n\nŞu anki Seviyen: **${currentLvl}**\nReenkarne olmak için **${gerekenLevel}. Seviye** olman gerekiyor.\n*Daha fazla /avla yapmalısın!*`, 
                ephemeral: true 
            });
        }

        // --- REENKARNASYON İŞLEMİ ---
        
        // 1. Level ve Parayı Sıfırla (Envanter kalsın kıyak geçelim, istersen onu da silebilirsin)
        db.delete(`lvl_${user.id}`);
        db.delete(`xp_${user.id}`);
        db.delete(`para_${user.id}`);
        
        // 2. Reenkarnasyon Sayısını Artır
        const yeniReenk = reenkSayisi + 1;
        db.set(`reenkarnasyon_${user.id}`, yeniReenk);

        // 3. Rütbe Belirle (Roma Rakamı)
        const romaRakamlari = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
        const rutbeIsareti = romaRakamlari[reenkSayisi] || yeniReenk; // 10'dan sonra sayı yazar

        // 4. İsim Güncelleme
        try {
            // Eski [KADİM X] yazısını temizleyip yenisini ekleyelim
            let yeniIsim = interaction.member.displayName;
            // Eğer zaten rütbesi varsa temizle (Regex ile köşeli parantez içini bul)
            yeniIsim = yeniIsim.replace(/\[KADİM.*?\]\s*/g, ""); 
            
            await interaction.member.setNickname(`[KADİM ${rutbeIsareti}] ${yeniIsim}`);
        } catch (e) {
            console.log("İsim değiştirme yetkisi yok (Yönetici olabilir).");
        }

        const embed = new EmbedBuilder()
            .setTitle('🌀 RUHSAL YÜKSELİŞ GERÇEKLEŞTİ!')
            .setDescription(`
                Eski bedenin yok oldu... Ruhun daha güçlü bir formda geri döndü!
                
                🆙 **Yeni Kademe:** KADİM ${rutbeIsareti}
                📉 **Sıfırlananlar:** Level, XP, Para
                🔥 **Sonraki Hedef:** ${10 + (yeniReenk * 15)} Level
            `)
            .setColor('Purple')
            .setThumbnail('https://media.tenor.com/7gK_gXQZ1m0AAAAC/level-up.gif');

        await interaction.reply({ embeds: [embed] });
    }
};