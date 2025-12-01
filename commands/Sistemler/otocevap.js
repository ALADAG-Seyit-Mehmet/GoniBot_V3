const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const db = require('croxydb');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('oto-cevap')
        .setDescription('Botun otomatik vereceği cevapları ayarla.')
        .addSubcommand(s => s.setName('ekle').setDescription('Yeni cevap ekle').addStringOption(o=>o.setName('tetik').setDescription('Hangi kelimeye?').setRequired(true)).addStringOption(o=>o.setName('cevap').setDescription('Ne desin?').setRequired(true)))
        .addSubcommand(s => s.setName('sil').setDescription('Cevap sil').addStringOption(o=>o.setName('tetik').setDescription('Hangi kelime?').setRequired(true)))
        .addSubcommand(s => s.setName('liste').setDescription('Tüm cevapları gör')),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({content:'Yetkin yok.', ephemeral:true});
        
        const sub = interaction.options.getSubcommand();

        if (sub === 'ekle') {
            const tetik = interaction.options.getString('tetik').toLowerCase();
            const cevap = interaction.options.getString('cevap');
            db.set(`otocevap_${interaction.guild.id}_${tetik}`, cevap);
            db.push(`otocevap_liste_${interaction.guild.id}`, tetik);
            interaction.reply(`✅ Eklendi! Biri **"${tetik}"** yazarsa bot **"${cevap}"** diyecek.`);
        }

        if (sub === 'sil') {
            const tetik = interaction.options.getString('tetik').toLowerCase();
            if (!db.fetch(`otocevap_${interaction.guild.id}_${tetik}`)) return interaction.reply("Böyle bir komut yok.");
            db.delete(`otocevap_${interaction.guild.id}_${tetik}`);
            // Listeden silme işlemi (Array filter)
            const liste = db.fetch(`otocevap_liste_${interaction.guild.id}`) || [];
            const yeniListe = liste.filter(x => x !== tetik);
            db.set(`otocevap_liste_${interaction.guild.id}`, yeniListe);
            interaction.reply(`🗑️ **"${tetik}"** silindi.`);
        }

        if (sub === 'liste') {
            const liste = db.fetch(`otocevap_liste_${interaction.guild.id}`) || [];
            if (liste.length === 0) return interaction.reply("Hiç oto-cevap yok.");
            interaction.reply({ embeds: [new EmbedBuilder().setTitle('🤖 Oto-Cevap Listesi').setDescription(liste.map(x => `🔹 ${x}`).join('\n')).setColor('Blue')] });
        }
    }
};