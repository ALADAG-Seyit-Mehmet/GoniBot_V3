const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('yardım')
        .setDescription('Tüm komutları ve özelliklerini listeler.'),

    async execute(interaction) {
        const embed = new EmbedBuilder()
            .setTitle(`🤖 ${interaction.client.user.username} Yardım Menüsü`)
            .setDescription(`Aşağıda botun tüm komutları kategorilere ayrılmış şekilde listelenmiştir.\n\n**İşaretlerin Anlamı:**\n👮‍♂️ = **Sadece Yetkililer (Yönetici/Mod Rolü)**\n👤 = **Tüm Kullanıcılar**`)
            .setColor('Gold')
            .setThumbnail(interaction.client.user.displayAvatarURL())
            .setFooter({ text: 'GoniBot v3.0 • Yardım Sistemi' })
            .setTimestamp();

        // Komut Klasörlerini Oku
        const folders = fs.readdirSync('./commands');

        for (const folder of folders) {
            const files = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
            if (files.length === 0) continue;

            // Kategoriye Göre Emoji ve Yetki Belirle
            let emoji = '📂';
            let yetki = '👤'; // Varsayılan: Herkes

            if (folder === 'Moderasyon') { emoji = '🛠️'; yetki = '👮‍♂️'; }
            if (folder === 'Koruma') { emoji = '🛡️'; yetki = '👮‍♂️'; }
            if (folder === 'Sistemler') { emoji = '⚙️'; yetki = '👮‍♂️'; }
            if (folder === 'Core') { emoji = '🧠'; }
            if (folder === 'Ekonomi') { emoji = '💰'; }
            if (folder === 'RPG') { emoji = '⚔️'; }
            if (folder === 'Eglence') { emoji = '🎲'; }
            if (folder === 'Suc') { emoji = '🔪'; }

            // Komutları Tek Tek Listele
            const commandList = files.map(file => {
                try {
                    const cmd = require(`../${folder}/${file}`);
                    if (cmd.data && cmd.data.name) {
                        return `\`/${cmd.data.name}\`: ${cmd.data.description}`;
                    }
                } catch (e) { return null; }
            }).filter(c => c !== null).join('\n');

            if (commandList) {
                embed.addFields({
                    name: `${emoji} ${folder} (${yetki})`,
                    value: commandList
                });
            }
        }

        await interaction.reply({ embeds: [embed] });
    },
};