const db = require('croxydb');
const { Hercai } = require('hercai');
const hercai = new Hercai({});
const { AttachmentBuilder } = require('discord.js');
const { Rank } = require('canvacord');

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot || !message.guild) return;

        // --- OTO CEVAP SİSTEMİ (YENİ) ---
        // Kullanıcının yazdığı mesajı küçük harfe çevirip kontrol et
        const otoCevap = db.fetch(`otocevap_${message.guild.id}_${message.content.toLowerCase()}`);
        if (otoCevap) {
            return message.reply(otoCevap);
        }

        // --- DİĞER SİSTEMLER ---
        // AFK
        message.mentions.users.forEach(u => {
            const afk = db.fetch(`afk_${u.id}`);
            if (afk) message.reply(`💤 **${u.username}** AFK: ${afk.sebep}`);
        });
        if (db.fetch(`afk_${message.author.id}`)) {
            db.delete(`afk_${message.author.id}`);
            message.reply("👋 AFK modundan çıktın.");
        }

        // Koruma
        if (db.fetch(`kufurEngel_${message.guild.id}`)) {
            if (["kufur", "mk", "oç"].some(k => message.content.toLowerCase().includes(k))) {
                try { await message.delete(); } catch(e){}
                return message.channel.send(`${message.author} 🚨 Küfür Yasak!`).then(x => setTimeout(()=>x.delete(), 3000));
            }
        }

        // Level
        const xpKey = `xp_${message.author.id}`;
        const lvlKey = `lvl_${message.author.id}`;
        db.add(xpKey, 5);
        let cxp = db.fetch(xpKey) || 0;
        let clvl = db.fetch(lvlKey) || 0;
        if (cxp >= (clvl+1)*200) {
            db.set(lvlKey, clvl+1);
            const rank = new Rank()
                .setAvatar(message.author.displayAvatarURL({extension:'png',forceStatic:true}))
                .setCurrentXP(cxp).setRequiredXP((clvl+1)*200).setLevel(clvl+1)
                .setUsername(message.author.username).setDiscriminator("0000").setProgressBar("#00FFFF", "COLOR");
            rank.build().then(b => message.channel.send({content:`🎉 Level Up!`, files:[new AttachmentBuilder(b, {name:'lvl.png'})]}));
        }

        // Global & AI
        const gid = db.fetch(`globalKanal_${message.guild.id}`);
        if (message.channel.id === gid) {
            client.guilds.cache.forEach(g => {
                if(g.id!==message.guild.id){
                    const t = db.fetch(`globalKanal_${g.id}`);
                    if(t) g.channels.cache.get(t)?.send(`**[${message.guild.name}] ${message.author.username}:** ${message.content}`);
                }
            });
        }
        if (message.content.includes(client.user.id)) {
            try { const r = await hercai.question({model:"v3",content:message.content}); message.reply(r.reply); } catch(e){}
        }
    }
};