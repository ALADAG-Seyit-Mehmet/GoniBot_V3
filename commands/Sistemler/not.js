const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('croxydb');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('not')
        .setDescription('Kişisel notlarını yönet.')
        .addSubcommand(s => s.setName('ekle').setDescription('Not al').addStringOption(o => o.setName('icerik').setDescription('Ne yazayım?').setRequired(true)))
        .addSubcommand(s => s.setName('sil').setDescription('Not sil (Sıra numarası ile)').addIntegerOption(o => o.setName('no').setDescription('Kaçıncı not?').setRequired(true)))
        .addSubcommand(s => s.setName('liste').setDescription('Notlarını oku')),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const key = `notlar_${interaction.user.id}`;
        let notlar = db.fetch(key) || [];

        if (sub === 'ekle') {
            const icerik = interaction.options.getString('icerik');
            db.push(key, icerik);
            interaction.reply({ content: `✅ Not alındı: **"${icerik}"**`, ephemeral: true });
        }

        if (sub === 'liste') {
            if (notlar.length === 0) return interaction.reply({ content: "📝 Hiç notun yok.", ephemeral: true });
            
            const listeMetni = notlar.map((n, i) => `**${i + 1}.** ${n}`).join('\n');
            const embed = new EmbedBuilder()
                .setTitle(`📒 ${interaction.user.username}'in Notları`)
                .setDescription(listeMetni)
                .setColor('Yellow')
                .setFooter({ text: 'Sadece sen görebilirsin.' });
            
            interaction.reply({ embeds: [embed], ephemeral: true }); // Sadece kullanıcı görür
        }

        if (sub === 'sil') {
            const no = interaction.options.getInteger('no');
            if (no < 1 || no > notlar.length) return interaction.reply({ content: "❌ Geçersiz not numarası.", ephemeral: true });
            
            const silinen = notlar[no - 1];
            // Belirtilen indexi sil
            notlar.splice(no - 1, 1);
            db.set(key, notlar); // Güncel listeyi kaydet
            
            interaction.reply({ content: `🗑️ **"${silinen}"** notu silindi.`, ephemeral: true });
        }
    }
};