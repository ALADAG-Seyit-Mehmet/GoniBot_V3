const { ActivityType } = require('discord.js');
const db = require('croxydb');

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`🚀 ${client.user.tag} Borsa Sistemini Başlattı!`);
        client.user.setActivity("Borsayı", { type: ActivityType.Watching });

        // --- PİYASA BAŞLANGIÇ FİYATLARI (Eğer yoksa) ---
        if(!db.fetch('market_BTC')) db.set('market_BTC', 50000); // Bitcoin
        if(!db.fetch('market_USD')) db.set('market_USD', 30);    // Dolar
        if(!db.fetch('market_GLD')) db.set('market_GLD', 2000);  // Altın
        if(!db.fetch('market_GNI')) db.set('market_GNI', 100);   // Goni Hisse

        // --- PİYASA DALGALANMA MOTORU (Her 1 Dakikada Bir) ---
        setInterval(() => {
            const assets = ['BTC', 'USD', 'GLD', 'GNI'];
            
            assets.forEach(asset => {
                let price = db.fetch(`market_${asset}`);
                
                // %5 ile -%5 arası rastgele değişim
                const degisimOrani = (Math.random() * 0.1) - 0.05; 
                let yeniFiyat = Math.floor(price * (1 + degisimOrani));
                
                // Fiyat asla 1'in altına düşmesin
                if (yeniFiyat < 1) yeniFiyat = 1;

                db.set(`market_${asset}`, yeniFiyat);
                
                // Değişim yönünü kaydet (Grafik için)
                const yon = yeniFiyat > price ? "up" : "down";
                db.set(`trend_${asset}`, yon);
            });
            
            // console.log("Borsa güncellendi."); // Log kirliliği olmasın diye kapalı
        }, 60000); // 1 Dakika

        // --- ESKİ ZAMANLAYICILAR (Boss vb.) ---
        setInterval(() => {
            if (Math.random() > 0.8) {
                 client.guilds.cache.forEach(g => {
                     const chID = db.fetch(`globalKanal_${g.id}`);
                     const ch = g.channels.cache.get(chID);
                     if(ch) {
                         const btn = { type: 1, components: [{ type: 2, label: "SALDIR", style: 4, custom_id: "boss_vur" }] };
                         ch.send({ content: "👹 **DÜNYA BOSSU BELİRDİ!**", components: [btn] }).then(m => db.set(`boss_${m.id}`, 5000));
                     }
                 });
            }
        }, 3600000);
    }
};