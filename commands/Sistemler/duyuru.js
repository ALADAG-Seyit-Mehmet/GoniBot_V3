const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('duyuru')
        .setDescription('Resmi duyuru yap.')
        .addStringOption(o => o.setName('mesaj').setDescription('Duyuru metni').setRequired(true))
        .addChannelOption(o => o.setName('kanal').setDescription('Nereye?').addChannelTypes(ChannelType.GuildText))
        .addStringOption(o => o.setName('baslik').setDescription('Başlık ne olsun?'))
        .addBooleanOption(o => o.setName('etiket').setDescription('Everyone atılsın mı?')),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({content:'Yetkin yok.', ephemeral:true});

        const mesaj = interaction.options.getString('mesaj');
        const kanal = interaction.options.getChannel('kanal') || interaction.channel;
        const baslik = interaction.options.getString('baslik') || '📢 DUYURU';
        const etiket = interaction.options.getBoolean('etiket');

        const embed = new EmbedBuilder()
            .setTitle(baslik)
            .setDescription(mesaj)
            .setColor('Random')
            .setThumbnail(interaction.guild.iconURL())
            .setFooter({ text: `${interaction.user.tag} tarafından`, iconURL: interaction.user.displayAvatarURL() })
            .setTimestamp();

        await kanal.send({ content: etiket ? '@everyone' : null, embeds: [embed] });
        await interaction.reply({ content: `✅ Duyuru ${kanal} kanalına gönderildi.`, ephemeral: true });
    }
};