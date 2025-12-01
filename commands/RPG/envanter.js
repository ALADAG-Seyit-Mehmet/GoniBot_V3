const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('croxydb');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('envanter')
        .setDescription('Sırt çantana bak.'),

    async execute(interaction) {
        const env = db.fetch(`envanter_${interaction.user.id}`) || [];
        
        if (env.length === 0) {
            return interaction.reply({ 
                embeds: [new EmbedBuilder().setDescription('🎒 **Çantan bomboş!**\nGit biraz `/avla` yap veya `/kasa-ac`.').setColor('Red')] 
            });
        }

        // Eşyaları Say ve Grupla
        const counts = {};
        env.forEach(x => { counts[x] = (counts[x] || 0) + 1; });
        
        // Listeyi Şekillendir
        const liste = Object.keys(counts).map(k => {
            let emoji = "📦";
            if(k.includes("Kılıç") || k.includes("Bıçak")) emoji = "⚔️";
            if(k.includes("Zırh") || k.includes("Deri")) emoji = "🛡️";
            if(k.includes("Elmas") || k.includes("Altın")) emoji = "💎";
            if(k.includes("İksir")) emoji = "🧪";
            
            return `> ${emoji} **${k}** \`x${counts[k]}\``;
        }).join('\n');

        const embed = new EmbedBuilder()
            .setTitle(`🎒 ${interaction.user.username}'in Envanteri`)
            .setDescription(`**Toplam Eşya:** ${env.length}\n\n${liste}`)
            .setColor('Orange')
            .setThumbnail('https://cdn-icons-png.flaticon.com/512/941/941565.png'); // Çanta ikonu

        interaction.reply({ embeds: [embed] });
    }
};