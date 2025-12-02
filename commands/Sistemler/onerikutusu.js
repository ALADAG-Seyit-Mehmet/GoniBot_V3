const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('oneri-kutusu-kur')
        .setDescription('Öneri toplama sistemini kurar.'),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) 
            return interaction.reply({ content: '❌ Yetkin yok.', ephemeral: true });

        const embed = new EmbedBuilder()
            .setTitle('💡 Öneri ve İstek Kutusu')
            .setDescription(`
                Sunucumuzu geliştirmek için fikirlerinize ihtiyacımız var!
                
                Aşağıdaki butona tıklayarak aklınızdaki fikirleri, şikayetleri veya istekleri **doğrudan Yönetime** iletebilirsiniz.
                
                *Mesajınız gizli tutulacak ve sadece Sunucu Sahibi görecektir.*
            `)
            .setColor('Yellow')
            .setThumbnail(interaction.guild.iconURL())
            .setFooter({ text: 'GoniBot İletişim Sistemi' });

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('btn_oneri_yap')
                .setLabel('Bir Öneri Yap')
                .setStyle(ButtonStyle.Primary)
                .setEmoji('📩')
        );

        await interaction.channel.send({ embeds: [embed], components: [row] });
        await interaction.reply({ content: '✅ Öneri kutusu kuruldu!', ephemeral: true });
    }
};