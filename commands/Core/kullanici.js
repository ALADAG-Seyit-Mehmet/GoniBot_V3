const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kullanici')
        .setDescription('Kullanıcı görselleri.')
        .addSubcommand(s => s.setName('avatar').setDescription('Profil fotoğrafı').addUserOption(o=>o.setName('kisi').setDescription('Kim?')))
        .addSubcommand(s => s.setName('banner').setDescription('Arkaplan görseli').addUserOption(o=>o.setName('kisi').setDescription('Kim?'))),

    async execute(interaction) {
        const sub = interaction.options.getSubcommand();
        const user = interaction.options.getUser('kisi') || interaction.user;

        // Banner için fetch (API'den çekmek gerekir)
        const fullUser = await user.fetch({ force: true });

        if (sub === 'avatar') {
            const avatarURL = fullUser.displayAvatarURL({ dynamic: true, size: 1024 });
            const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel('Tarayıcıda Aç').setStyle(ButtonStyle.Link).setURL(avatarURL));
            
            const embed = new EmbedBuilder()
                .setTitle(`${fullUser.username} Avatarı`)
                .setImage(avatarURL)
                .setColor('Random');
            
            interaction.reply({ embeds: [embed], components: [row] });
        }

        if (sub === 'banner') {
            const bannerURL = fullUser.bannerURL({ dynamic: true, size: 1024 });
            
            if (!bannerURL) return interaction.reply({ content: 'Bu kullanıcının bannerı yok (Veya Nitro kullanmıyor).', ephemeral: true });

            const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setLabel('Tarayıcıda Aç').setStyle(ButtonStyle.Link).setURL(bannerURL));
            
            const embed = new EmbedBuilder()
                .setTitle(`${fullUser.username} Bannerı`)
                .setImage(bannerURL)
                .setColor('Random');
            
            interaction.reply({ embeds: [embed], components: [row] });
        }
    }
};