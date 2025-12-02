const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-kur')
        .setDescription('Butonlu destek panelini kurar.'),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) 
            return interaction.reply({ content: '❌ Bunu sadece yöneticiler kurabilir.', ephemeral: true });

        const embed = new EmbedBuilder()
            .setTitle('🎫 GoniBot Destek Merkezi')
            .setDescription(`
                Merhaba! Yardıma mı ihtiyacın var?
                İşlemini hızlandırmak için lütfen aşağıdaki **ilgili butona** tıkla.
                
                🟢 **Canlı Destek:** Genel sorular ve yardım.
                🔴 **Şikayet:** Kural ihlali ve raporlama.
                🟡 **Başvuru:** Yetkili alım görüşmeleri.
            `)
            .setColor('Blurple')
            .setImage('https://media.discordapp.net/attachments/1033464536838328391/1085609424757112922/ticket_banner.png')
            .setFooter({ text: 'Gereksiz ticket açmak yasaktır.', iconURL: interaction.guild.iconURL() });

        // BUTONLAR (Dropdown yerine bunlar geldi)
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('ticket_destek').setLabel('Canlı Destek').setStyle(ButtonStyle.Success).setEmoji('🟢'),
            new ButtonBuilder().setCustomId('ticket_sikayet').setLabel('Şikayet/Bildiri').setStyle(ButtonStyle.Danger).setEmoji('🔴'),
            new ButtonBuilder().setCustomId('ticket_basvuru').setLabel('Yetkili Başvurusu').setStyle(ButtonStyle.Primary).setEmoji('🟡')
        );

        await interaction.channel.send({ embeds: [embed], components: [row] });
        await interaction.reply({ content: '✅ Butonlu ticket paneli kuruldu!', ephemeral: true });
    }
};