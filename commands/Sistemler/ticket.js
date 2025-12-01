const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-kur')
        .setDescription('Gelişmiş destek panelini kurar.'),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) 
            return interaction.reply({ content: '❌ Bunu sadece yöneticiler kurabilir.', ephemeral: true });

        const embed = new EmbedBuilder()
            .setTitle('🎫 Müşteri Hizmetleri & Destek')
            .setDescription(`Merhaba! Bir sorun mu yaşıyorsun?\nAşağıdaki menüden ilgili departmanı seçerek bize ulaşabilirsin.\n\n⏱️ **Ortalama Yanıt Süresi:** 5 Dakika\n🛡️ **Güvenlik:** Tüm görüşmeler kayıt altına alınır.`)
            .addFields(
                { name: '🟢 Canlı Destek', value: 'Genel sorular ve yardım.', inline: true },
                { name: '🔴 Şikayet', value: 'Kural ihlali bildirimi.', inline: true },
                { name: '🟡 Başvuru', value: 'Yetkili alım görüşmeleri.', inline: true }
            )
            .setColor('Blurple')
            .setImage('https://media.discordapp.net/attachments/1033464536838328391/1085609424757112922/ticket_banner.png')
            .setFooter({ text: 'GoniBot Destek Sistemi', iconURL: interaction.guild.iconURL() });

        const menu = new StringSelectMenuBuilder()
            .setCustomId('ticket_secim')
            .setPlaceholder('Buraya tıkla ve bir konu seç...')
            .addOptions(
                { label: 'Genel Destek', description: 'Yardım almak istiyorum.', value: 'ticket_destek', emoji: '🟢' },
                { label: 'Şikayet / Bildiri', description: 'Bir kullanıcıyı raporlamak istiyorum.', value: 'ticket_sikayet', emoji: '🔴' },
                { label: 'Yetkili Başvurusu', description: 'Ekibe katılmak istiyorum.', value: 'ticket_basvuru', emoji: '🟡' }
            );

        const row = new ActionRowBuilder().addComponents(menu);
        await interaction.channel.send({ embeds: [embed], components: [row] });
        await interaction.reply({ content: '✅ Gelişmiş ticket paneli kuruldu!', ephemeral: true });
    }
};