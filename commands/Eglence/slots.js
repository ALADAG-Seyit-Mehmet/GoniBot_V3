const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('croxydb');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slots')
        .setDescription('Slot makinesini çevir.')
        .addIntegerOption(o => o.setName('bahis').setDescription('Ne kadar basıyorsun?').setRequired(true)),

    async execute(interaction) {
        const bahis = interaction.options.getInteger('bahis');
        const para = db.fetch(`para_${interaction.user.id}`) || 0;

        if (bahis <= 0) return interaction.reply({ content: "0'dan büyük bir bahis gir.", ephemeral: true });
        if (para < bahis) return interaction.reply({ content: "💸 Paran yetmiyor!", ephemeral: true });

        const fruits = ['🍒', '🍋', '🍇', '🍉', '🍓', '💎', '7️⃣'];
        const s1 = fruits[Math.floor(Math.random() * fruits.length)];
        const s2 = fruits[Math.floor(Math.random() * fruits.length)];
        const s3 = fruits[Math.floor(Math.random() * fruits.length)];

        let sonuc = "Kaybettin...";
        let renk = "Red";
        let kazanc = -bahis;

        // Kazanma Durumları
        if (s1 === s2 && s2 === s3) {
            sonuc = "JACKPOT! (3x)";
            kazanc = bahis * 3;
            renk = "Gold";
        } else if (s1 === s2 || s1 === s3 || s2 === s3) {
            sonuc = "KÜÇÜK ÖDÜL! (1.5x)";
            kazanc = Math.floor(bahis * 1.5);
            renk = "Green";
        }

        db.add(`para_${interaction.user.id}`, kazanc);

        const embed = new EmbedBuilder()
            .setTitle('🎰 Slot Makinesi')
            .setDescription(`
                **[ ${s1} | ${s2} | ${s3} ]**
                
                ${sonuc}
                **Etki:** ${kazanc > 0 ? '+' : ''}${kazanc} TL
            `)
            .setColor(renk);

        await interaction.reply({ embeds: [embed] });
    }
};