const { SlashCommandBuilder, EmbedBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const db = require('croxydb');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('itiraf')
        .setDescription('Anonim itiraf sistemi.')
        .addSubcommand(s => s.setName('yap').setDescription('İçini dök (Kimlik gizli)').addStringOption(o => o.setName('mesaj').setDescription('İtirafın').setRequired(true)))
        .addSubcommand(s => s.setName('kanal-ayarla').setDescription('İtiraflar nereye gitsin?').addChannelOption(o => o.setName('kanal').setDescription('Kanal seç').setRequired(true))),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();

        // Kanal Ayarlama
        if (sub === 'kanal-ayarla') {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) return interaction.reply({ content: 'Yetkin yok.', ephemeral: true });
            const kanal = interaction.options.getChannel('kanal');
            db.set(`itirafKanal_${interaction.guild.id}`, kanal.id);
            return interaction.reply(`✅ İtiraf kanalı ${kanal} olarak ayarlandı.`);
        }

        // İtiraf Yapma
        if (sub === 'yap') {
            const kanalID = db.fetch(`itirafKanal_${interaction.guild.id}`);
            if (!kanalID) return interaction.reply({ content: '❌ Sunucuda itiraf kanalı ayarlanmamış!', ephemeral: true });
            
            const mesaj = interaction.options.getString('mesaj');
            const channel = interaction.guild.channels.cache.get(kanalID);

            const embed = new EmbedBuilder()
                .setTitle('🤫 Anonim Bir İtiraf!')
                .setDescription(`> "${mesaj}"`)
                .setColor('Random')
                .setFooter({ text: 'Kimliği bizde saklı...', iconURL: interaction.guild.iconURL() })
                .setTimestamp();

            await channel.send({ embeds: [embed] });
            await interaction.reply({ content: '🕵️ İtirafın anonim olarak gönderildi.', ephemeral: true });
        }
    }
};