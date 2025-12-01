const db = require('croxydb');
const { Hercai } = require('hercai');
const hercai = new Hercai({});
const { AttachmentBuilder } = require('discord.js');
const { Rank } = require('canvacord'); // Resim kütüphanesi

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot || !message.guild) return;

        // --- KORUMA SİSTEMLERİ ---
        if (db.fetch(`kufurEngel_${message.guild.id}`)) {
            if (["kufur", "aptal", "mal", "gerizekalı", "mk"].some(k => message.content.toLowerCase().includes(k))) {
                try { await message.delete(); } catch(e){}
                return message.channel.send(`${message.author} 🚨 **Terbiyeni takın!**`).then(x => setTimeout(()=>x.delete(), 3000));
            }
        }

        // --- LEVEL SİSTEMİ (ARTIK RESİMLİ) ---
        const xpKey = `xp_${message.author.id}`;
        const lvlKey = `lvl_${message.author.id}`;
        
        // Rastgele 1-5 XP ver
        const randomXp = Math.floor(Math.random() * 5) + 1;
        db.add(xpKey, randomXp);

        let currentXp = db.fetch(xpKey) || 0;
        let currentLvl = db.fetch(lvlKey) || 0;
        let nextLvlXp = (currentLvl + 1) * 200; // Her levelde zorlaşır (Örn: Lvl 1 için 200, Lvl 2 için 400)

        if (currentXp >= nextLvlXp) {
            db.set(lvlKey, currentLvl + 1);
            // XP'yi sıfırlama, birikerek gitsin (RPG mantığı)
            
            // KART OLUŞTURMA
            const rank = new Rank()
                .setAvatar(message.author.displayAvatarURL({ extension: 'png', forceStatic: true }))
                .setCurrentXP(currentXp)
                .setRequiredXP(nextLvlXp + 200) // Bir sonraki hedef
                .setLevel(currentLvl + 1)
                .setProgressBar("#00FFFF", "COLOR")
                .setUsername(message.author.username)
                .setDiscriminator(message.author.discriminator === '0' ? ' ' : message.author.discriminator)
                .setStatus("online")
                .setRank(0, "LVL", false) // Sıralamayı gizle (DB karmaşası olmasın diye)
                .setBackground("IMAGE", "https://i.imgur.com/8nLFCVP.png"); // Havalı mavi arka plan

            rank.build().then(buffer => {
                const attachment = new AttachmentBuilder(buffer, { name: 'levelup.png' });
                message.channel.send({ content: `🎉 **TEBRİKLER!** Seviye Atladın!`, files: [attachment] });
            });
        }

        // --- GLOBAL CHAT ---
        const globalID = db.fetch(`globalKanal_${message.guild.id}`);
        if (message.channel.id === globalID) {
            client.guilds.cache.forEach(g => {
                if(g.id === message.guild.id) return;
                const target = db.fetch(`globalKanal_${g.id}`);
                if(target) {
                    const ch = g.channels.cache.get(target);
                    if(ch) ch.send(`**[${message.guild.name}] ${message.author.username}:** ${message.content}`);
                }
            });
        }

        // --- AI SOHBET ---
        if (message.content.includes(client.user.id)) {
            try {
                message.channel.sendTyping();
                const res = await hercai.question({model:"v3", content: message.content});
                message.reply(res.reply);
            } catch(e) { console.log(e); }
        }
    }
};