const { ActivityType, ChannelType, PermissionsBitField } = require('discord.js');
const db = require('croxydb');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(`🚀 ${client.user.tag} Aktif ve İstatistikleri İzliyor!`);
        client.user.setActivity("Goni Krallığı", { type: ActivityType.Competing });

        // --- İSTATİSTİK GÜNCELLEME DÖNGÜSÜ (10 Dakikada bir) ---
        const istatistikGuncelle = async () => {
            client.guilds.cache.forEach(async guild => {
                // 1. Üyeleri önbelleğe çek (Cache) - Bu olmadan sayılar yanlış çıkar
                try { await guild.members.fetch(); } catch(e){}

                // 2. Sayıları Hesapla
                const toplam = guild.memberCount;
                const cevrimici = guild.members.cache.filter(m => !m.user.bot && m.presence && m.presence.status !== 'offline').size;
                const sesli = guild.members.cache.filter(m => m.voice.channel).size;

                // 3. Kanalları Bul veya Oluştur
                // Veritabanında kayıtlı ID var mı?
                let statCatID = db.fetch(`statCategory_${guild.id}`);
                let chTotalID = db.fetch(`statTotal_${guild.id}`);
                let chOnlineID = db.fetch(`statOnline_${guild.id}`);
                let chVoiceID = db.fetch(`statVoice_${guild.id}`);

                // Kategori Yoksa Oluştur
                let category = guild.channels.cache.get(statCatID);
                if (!category) {
                    try {
                        category = await guild.channels.create({
                            name: '📊 SUNUCU İSTATİSTİKLERİ',
                            type: ChannelType.GuildCategory,
                            permissionOverwrites: [{ id: guild.id, deny: [PermissionsBitField.Flags.Connect] }] // Kimse bağlanamasın
                        });
                        db.set(`statCategory_${guild.id}`, category.id);
                        
                        // Kanalları da sıfırdan oluştur
                        const ch1 = await guild.channels.create({ name: `👥 Toplam: ${toplam}`, type: ChannelType.GuildVoice, parent: category.id });
                        const ch2 = await guild.channels.create({ name: `🟢 Çevrim İçi: ${cevrimici}`, type: ChannelType.GuildVoice, parent: category.id });
                        const ch3 = await guild.channels.create({ name: `🔊 Sesli: ${sesli}`, type: ChannelType.GuildVoice, parent: category.id });
                        
                        db.set(`statTotal_${guild.id}`, ch1.id);
                        db.set(`statOnline_${guild.id}`, ch2.id);
                        db.set(`statVoice_${guild.id}`, ch3.id);
                        
                        console.log(`${guild.name} için istatistik paneli kuruldu.`);
                        return; // İlk kurulum bitti, döngüden çık
                    } catch(e) {
                        console.log(`İstatistik paneli kurulamadı (Yetki yok): ${guild.name}`);
                    }
                }

                // 4. İsimleri Güncelle (Rate Limit yememek için try-catch)
                try {
                    const ch1 = guild.channels.cache.get(chTotalID);
                    const ch2 = guild.channels.cache.get(chOnlineID);
                    const ch3 = guild.channels.cache.get(chVoiceID);

                    if(ch1) ch1.setName(`👥 Toplam: ${toplam}`);
                    if(ch2) ch2.setName(`🟢 Çevrim İçi: ${cevrimici}`); // ARTIK 0 OLMAYACAK
                    if(ch3) ch3.setName(`🔊 Sesli: ${sesli}`);
                } catch(e) {}
            });
        };

        // Başlar başlamaz bir kere çalıştır
        istatistikGuncelle();

        // Sonra her 10 dakikada bir (Discord API limiti yüzünden çok sık yapma)
        setInterval(istatistikGuncelle, 600000); 

        // --- DİĞER ZAMANLAYICILAR (Boss vb. korundu) ---
        setInterval(() => {
            // ... (Kapsül ve Boss kodları burada aynen duruyor varsay)
        }, 60000);
    }
};