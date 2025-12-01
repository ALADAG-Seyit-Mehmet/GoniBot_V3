const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('croxydb');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('tkm')
        .setDescription('Botla Taş Kağıt Makas oyna.')
        .addStringOption(o => o.setName('secim').setDescription('Seçimin?').setRequired(true).addChoices({name:'Taş 🪨', value:'tas'}, {name:'Kağıt 📄', value:'kagit'}, {name:'Makas ✂️', value:'makas'}))
        .addIntegerOption(o => o.setName('bahis').setDescription('Ne kadar basıyorsun?').setRequired(true)),

    async execute(interaction) {
        const secim = interaction.options.getString('secim');
        const bahis = interaction.options.getInteger('bahis');
        const para = db.fetch(`para_${interaction.user.id}`) || 0;

        if (para < bahis) return interaction.reply("💸 Paran yetmiyor!");

        const ihtimaller = ['tas', 'kagit', 'makas'];
        const botSecim = ihtimaller[Math.floor(Math.random() * 3)];
        
        let sonuc = "";
        let renk = "";
        let kazanc = 0;

        if (secim === botSecim) {
            sonuc = "BERABERE! Paran iade.";
            renk = "Yellow";
        } else if (
            (secim === 'tas' && botSecim === 'makas') ||
            (secim === 'kagit' && botSecim === 'tas') ||
            (secim === 'makas' && botSecim === 'kagit')
        ) {
            sonuc = "KAZANDIN! 🎉";
            renk = "Green";
            kazanc = bahis;
            db.add(`para_${interaction.user.id}`, bahis);
        } else {
            sonuc = "KAYBETTİN... 💀";
            renk = "Red";
            kazanc = -bahis;
            db.add(`para_${interaction.user.id}`, -bahis);
        }

        const embed = new EmbedBuilder()
            .setTitle('✂️ Taş Kağıt Makas')
            .setDescription(`
                Sen: **${secim.toUpperCase()}**
                Bot: **${botSecim.toUpperCase()}**
                
                👉 **SONUÇ:** ${sonuc}
            `)
            .setColor(renk);

        interaction.reply({ embeds: [embed] });
    }
};