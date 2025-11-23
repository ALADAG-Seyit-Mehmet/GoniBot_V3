const { ActivityType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('croxydb');

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        console.log(`🚀 ${client.user.tag} Aktif!`);
        client.user.setActivity("Goni'nin Krallığı", { type: ActivityType.Competing });

        // Zaman Kapsülü ve Boss Spawn (Zamanlayıcılar)
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
                         const btn = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("boss_vur").setLabel("SALDIR").setStyle(ButtonStyle.Danger));
                         ch.send({content: "👹 **DÜNYA BOSSU BELİRDİ!** (Can: 5000)", components: [btn]}).then(m => db.set(`boss_${m.id}`, 5000));
                     }
                 });
            }
        }, 3600000);
    }
};