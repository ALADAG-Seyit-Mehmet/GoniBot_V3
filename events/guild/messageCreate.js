const db = require('croxydb');
const { Hercai } = require('hercai');
const hercai = new Hercai({});

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot || !message.guild) return;

        // --- 1. KORUMA SİSTEMLERİ ---
        
        // Küfür Engel
        if (db.fetch(`kufurEngel_${message.guild.id}`)) {
            const kufurler = ["mk", "aq", "oc", "kaşar", "oç", "piç", "sikerim", "amk", "sik", "yarrak", "aptal"]; 
            if (kufurler.some(k => message.content.toLowerCase().split(" ").includes(k))) {
                try { await message.delete(); } catch(e){}
                return message.channel.send(`${message.author} 🚨 **Küfür Yasak!**`).then(x => setTimeout(()=>x.delete(), 3000));
            }
        }

        // Reklam Engel
        if (db.fetch(`reklamEngel_${message.guild.id}`)) {
            const reklamlar = ["discord.gg", "invite", "katıl", "davet"];
            if (reklamlar.some(r => message.content.toLowerCase().includes(r))) {
                try { await message.delete(); } catch(e){}
                return message.channel.send(`${message.author} 🚨 **Reklam Yasak!**`).then(x => setTimeout(()=>x.delete(), 3000));
            }
        }

        // Link Engel
        if (db.fetch(`linkEngel_${message.guild.id}`)) {
            if (message.content.includes("http") || message.content.includes(".com")) {
                try { await message.delete(); } catch(e){}
                return message.channel.send(`${message.author} 🚨 **Link Paylaşımı Yasak!**`).then(x => setTimeout(()=>x.delete(), 3000));
            }
        }

        // --- 2. GLOBAL CHAT ---
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

        // --- 3. DİĞERLERİ (Level, AI, Virus) ---
        db.add(`xp_${message.author.id}`, 5);

        if (message.content.includes(client.user.id)) {
            try {
                const res = await hercai.question({model:"v3", content: message.content});
                message.reply(res.reply);
            } catch(e) { console.log(e); }
        }

        if (db.fetch(`salgin_aktif`) && db.fetch(`enfekte_${message.author.id}`) && message.reference) {
            const ref = await message.fetchReference();
            if (Math.random() > 0.5 && !ref.author.bot) {
                db.set(`enfekte_${ref.author.id}`, true);
                message.channel.send(`🦠 **${ref.author.username}** virüsü kaptı!`);
            }
        }
    }
};