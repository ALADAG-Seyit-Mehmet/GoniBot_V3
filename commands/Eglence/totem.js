const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('croxydb');
module.exports = {
    data: new SlashCommandBuilder().setName('totem-birak').setDescription('Admin'),
    async execute(i) {
        if(!i.member.permissions.has('Administrator')) return;
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('totem_kap').setLabel('KAP').setStyle(ButtonStyle.Danger));
        const msg = await i.reply({content:"🗿 **TOTEM!** (Patlarsa atılırsın)", components:[row], fetchReply:true});
        let holder = null;
        const boom = Date.now()+30000;
        const int = setInterval(()=>{
            if(Date.now()>boom) { clearInterval(int); if(holder) { db.set(`para_${holder}`,0); i.guild.members.cache.get(holder)?.kick(); msg.edit({content:`💥 <@${holder}> Patladı!`, components:[]}); } else msg.edit({content:"Söndü.", components:[]}); }
            else if(holder) db.add(`para_${holder}`, 100);
        }, 2000);
        msg.createMessageComponentCollector({time:40000}).on('collect', btn=>{ holder=btn.user.id; btn.reply({content:"Sende!", ephemeral:true}); });
    }
};