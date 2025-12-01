const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('croxydb');
module.exports = {
    data: new SlashCommandBuilder().setName('pet').setDescription('Yoldaşın.').addSubcommand(s=>s.setName('sahiplen').setDescription('Ad ver').addStringOption(o=>o.setName('ad').setDescription('Ad').setRequired(true))).addSubcommand(s=>s.setName('bak').setDescription('Durum')),
    async execute(i) {
        if(i.options.getSubcommand()==='sahiplen') {
            if(db.fetch(`pet_${i.user.id}`)) return i.reply("Zaten var.");
            db.set(`pet_${i.user.id}`, {name:i.options.getString('ad'), lvl:1, hunger:100});
            i.reply("🐾 Sahiplendin!");
        } else {
            const p = db.fetch(`pet_${i.user.id}`);
            if(!p) return i.reply("Petin yok.");
            const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('pet_besle').setLabel('Besle').setStyle(ButtonStyle.Success));
            const embed = new EmbedBuilder().setTitle(`🐾 ${p.name}`).setDescription(`Lvl: ${p.lvl}\nTokluk: ${p.hunger}`);
            const msg = await i.reply({embeds:[embed], components:[row], fetchReply:true});
            msg.createMessageComponentCollector({time:30000}).on('collect', b=>{
                if(b.user.id!==i.user.id) return;
                p.hunger = Math.min(100, p.hunger+10); p.lvl++;
                db.set(`pet_${i.user.id}`, p);
                b.reply({content:"Yedi! 🍖", ephemeral:true});
            });
        }
    }
};