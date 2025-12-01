const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder().setName('duello').setDescription('VS At!').addUserOption(o=>o.setName('rakip').setDescription('Kim?').setRequired(true)),
    async execute(i) {
        const rakip = i.options.getUser('rakip');
        if(rakip.bot || rakip.id === i.user.id) return i.reply("Gerçek bir rakip bul.");
        
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('kabul').setLabel('KABUL ET').setStyle(ButtonStyle.Danger));
        const msg = await i.reply({content:`${rakip}, **${i.user.username}** sana meydan okuyor!`, components:[row], fetchReply:true});
        
        const col = msg.createMessageComponentCollector({time:30000});
        col.on('collect', async btn => {
            if(btn.user.id !== rakip.id) return;
            // Savaş Başlasın
            let hp1=100, hp2=100;
            let sira = i.user.id;
            
            const savas = async (txt) => {
                const embed = new EmbedBuilder().setTitle('⚔️ ARENA').setDescription(`**${i.user.username}:** ${hp1} HP\n**${rakip.username}:** ${hp2} HP\n\n${txt}`).setColor('Red');
                const acts = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('vur').setLabel('VUR 🗡️').setStyle(ButtonStyle.Danger),
                    new ButtonBuilder().setCustomId('iyiles').setLabel('İYİLEŞ 🧪').setStyle(ButtonStyle.Success)
                );
                return {embeds:[embed], components:(hp1>0&&hp2>0)?[acts]:[]};
            };
            
            await btn.update(await savas("Savaş Başladı!"));
            const fight = msg.createMessageComponentCollector({time:60000});
            fight.on('collect', async f => {
                if(f.user.id !== sira) return f.reply({content:"Sıranı bekle!", ephemeral:true});
                
                if(f.customId==='vur') {
                    const dmg = Math.floor(Math.random()*20)+5;
                    if(sira===i.user.id) hp2-=dmg; else hp1-=dmg;
                    sira = (sira===i.user.id)?rakip.id:i.user.id;
                    await f.update(await savas(`💥 ${dmg} hasar vuruldu!`));
                } else {
                    const heal = Math.floor(Math.random()*15)+5;
                    if(sira===i.user.id) hp1+=heal; else hp2+=heal;
                    sira = (sira===i.user.id)?rakip.id:i.user.id;
                    await f.update(await savas(`💚 ${heal} can yenilendi.`));
                }
                
                if(hp1<=0 || hp2<=0) {
                    fight.stop();
                    const win = (hp1>0) ? i.user : rakip;
                    msg.edit({content:`🏆 **KAZANAN:** ${win}`, components:[]});
                }
            });
        });
    }
};