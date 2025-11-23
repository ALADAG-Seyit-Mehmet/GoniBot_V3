const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('croxydb');
module.exports = {
    data: new SlashCommandBuilder().setName('nuke-satin-al').setDescription('100.000 TL'),
    async execute(i) {
        if((db.fetch(`para_${i.user.id}`)||0)<100000) return i.reply("Para yetersiz.");
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('nuke_patlat').setLabel('PATLAT').setStyle(ButtonStyle.Danger));
        const msg = await i.reply({content:"Hazır mı?", components:[row], fetchReply:true});
        const col = msg.createMessageComponentCollector({time:15000});
        col.on('collect', async btn => {
            if(btn.user.id!==i.user.id) return;
            db.add(`para_${i.user.id}`, -100000);
            await btn.reply("🚨 3... 2... 1...");
            setTimeout(async()=>{
                const n = await i.channel.clone();
                await i.channel.delete();
                n.send("☢️ **Kanal Sıfırlandı.**");
            }, 3000);
        });
    }
};