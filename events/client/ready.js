const { ActivityType } = require('discord.js');
const db = require('croxydb');

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`🚀 ${client.user.tag} Hazır ve Nazır!`);

        // --- DİNAMİK DURUM AYARI ---
        const states = [
            { name: "Goni'nin Krallığı", type: ActivityType.Competing },
            { name: "/yardım | Komutlar", type: ActivityType.Listening },
            { name: "Borsayı Takip Ediyor 📈", type: ActivityType.Watching },
            { name: `${client.guilds.cache.size} Sunucu | ${client.guilds.cache.reduce((a,b)=>a+b.memberCount,0)} Üye`, type: ActivityType.Watching }
        ];

        let i = 0;
        setInterval(() => {
            client.user.setActivity(states[i].name, { type: states[i].type });
            i = (i + 1) % states.length;
        }, 10000); // 10 Saniyede bir değişir

        // --- ZAMANLAYICILAR (Boss & Kapsül) ---
        setInterval(() => {
            const liste = db.fetch('kapsul_listesi') || [];
            liste.forEach(id => {
                const kapsul = db.fetch(`kapsul_${id}`);
                if (!kapsul) return;
                if (Date.now() >= kapsul.date) {
                    const ch = client.channels.cache.get(kapsul.channel);
                    if (ch) ch.send(`⌛ **Zaman Kapsülü:** <@${kapsul.user}> demiş ki: "${kapsul.msg}"`);
                    db.delete(`kapsul_${id}`);
                }
            });
        }, 60000);

        setInterval(() => {
            if (Math.random() > 0.8) {
                 client.guilds.cache.forEach(g => {
                     const chID = db.fetch(`globalKanal_${g.id}`);
                     const ch = g.channels.cache.get(chID);
                     if(ch) {
                         const btn = { type: 1, components: [{ type: 2, label: "SALDIR", style: 4, custom_id: "boss_vur" }] };
                         // Basit buton yapısı (require karmaşası olmasın diye)
                         ch.send({ content: "👹 **DÜNYA BOSSU BELİRDİ!**", components: [btn] }).then(m => db.set(`boss_${m.id}`, 5000));
                     }
                 });
            }
        }, 3600000);
    }
};