const db = require('croxydb');
const { Hercai } = require('hercai');
const hercai = new Hercai();

module.exports = {
    name: 'messageCreate',
    async execute(message, client) {
        if (message.author.bot || !message.guild) return;

        // Koruma
        if (db.fetch(`kufurEngel_${message.guild.id}`)) {
            if (["kufur", "aptal", "mal"].some(k => message.content.toLowerCase().includes(k))) {
                message.delete();
                return message.channel.send(`${message.author} 🚨 Küfür Yasak!`).then(x => setTimeout(()=>x.delete(), 3000));
            }
        }

        // Global Chat
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

        // Level & AI
        db.add(`xp_${message.author.id}`, 5);
        if (message.content.includes(client.user.id)) {
            const res = await hercai.question({model:"v3", content: message.content});
            message.reply(res.reply);
        }

        // Virüs
        if (db.fetch(`salgin_aktif`) && db.fetch(`enfekte_${message.author.id}`) && message.reference) {
            const ref = await message.fetchReference();
            if (Math.random() > 0.5 && !ref.author.bot) {
                db.set(`enfekte_${ref.author.id}`, true);
                message.channel.send(`🦠 **${ref.author.username}** virüsü kaptı!`);
            }
        }
    }
};