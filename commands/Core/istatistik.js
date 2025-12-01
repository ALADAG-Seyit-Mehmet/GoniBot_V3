const { SlashCommandBuilder, EmbedBuilder, version, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const db = require('croxydb');
const os = require('os');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('istatistik')
        .setDescription('Botun verilerini veya bir kullanıcının detaylı profilini gösterir.')
        .addUserOption(option => 
            option.setName('kullanici')
            .setDescription('Kimin profiline bakmak istiyorsun? (Boş bırakırsan Bot Bilgisi)')
            .setRequired(false)),

    async execute(interaction) {
        const targetUser = interaction.options.getUser('kullanici');

        // ====================================================
        // SENARYO 1: KULLANICI PROFİLİ (Biyografi Eklendi)
        // ====================================================
        if (targetUser) {
            const member = interaction.guild.members.cache.get(targetUser.id);
            const para = db.fetch(`para_${targetUser.id}`) || 0;
            const xp = db.fetch(`xp_${targetUser.id}`) || 0;
            const klan = db.fetch(`klan_${targetUser.id}`) || "Yok";
            const partnerID = db.fetch(`partner_${targetUser.id}`);
            const partner = partnerID ? `<@${partnerID}>` : "Bekar";
            const hapis = db.fetch(`hapis_${targetUser.id}`) ? "🔒 Hapiste" : "Serbest";
            
            // BİYOGRAFİYİ ÇEK
            const biyo = db.fetch(`biyografi_${targetUser.id}`) || "Henüz bir biyografi yazılmamış. (/biyografi)";

            const roles = member.roles.cache
                .filter(r => r.id !== interaction.guild.id)
                .sort((a, b) => b.position - a.position)
                .map(r => r)
                .slice(0, 10)
                .join(", ") || "Rolü Yok";

            const embed = new EmbedBuilder()
                .setAuthor({ name: targetUser.tag, iconURL: targetUser.displayAvatarURL() })
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
                .setColor(member.displayHexColor)
                .setDescription(`> *"${biyo}"*`) // Biyografi burada görünecek
                .addFields(
                    { name: '📅 Tarihçesi', value: `Sunucuya: <t:${parseInt(member.joinedTimestamp / 1000)}:R>\nDiscord'a: <t:${parseInt(targetUser.createdTimestamp / 1000)}:D>`, inline: true },
                    { name: '⚔️ RPG & Ekonomi', value: `💰 **${para} TL** | ✨ **${xp} XP**\n🏰 Klan: **${klan}** | 💍 **${partner}**`, inline: false },
                    { name: `🎭 Roller`, value: roles, inline: false }
                )
                .setFooter({ text: `GoniBot v3.0 • Profil` });

            return interaction.reply({ embeds: [embed] });
        }

        // ====================================================
        // SENARYO 2: BOT İSTATİSTİĞİ (Aynı Kaldı)
        // ====================================================
        
        const createStatsEmbed = (client) => {
            const uptime = process.uptime();
            const days = Math.floor(uptime / 86400);
            const hours = Math.floor(uptime / 3600) % 24;
            const minutes = Math.floor(uptime / 60) % 60;

            return new EmbedBuilder()
                .setTitle('🤖 GoniBot Sistem Verileri')
                .setDescription('Goni tarafından geliştirilen üst düzey yönetim ve eğlence botu.')
                .addFields(
                    { name: '👑 Geliştirici', value: 'Goni', inline: true },
                    { name: '🏓 Gecikme (Ping)', value: `**${client.ws.ping}ms**`, inline: true },
                    { name: '⏱️ Çalışma Süresi', value: `${days}g ${hours}s ${minutes}dk`, inline: true },
                    
                    { name: '📊 İstatistikler', value: `
                    💻 **Sunucu:** ${client.guilds.cache.size}
                    👥 **Kullanıcı:** ${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)}
                    📺 **Kanal:** ${client.channels.cache.size}
                    `, inline: true },

                    { name: '⚙️ Altyapı', value: `
                    🧠 **RAM:** ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
                    📚 **Discord.js:** v${version}
                    🟢 **Node.js:** ${process.version}
                    `, inline: true }
                )
                .setColor('DarkButNotBlack')
                .setThumbnail(client.user.displayAvatarURL());
        };

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('btn_yenile_stats').setLabel('Verileri Yenile').setStyle(ButtonStyle.Secondary).setEmoji('🔄')
        );

        const response = await interaction.reply({ embeds: [createStatsEmbed(interaction.client)], components: [row], fetchReply: true });

        const collector = response.createMessageComponentCollector({ time: 60000 });

        collector.on('collect', async i => {
            if (i.customId === 'btn_yenile_stats') {
                await i.update({ embeds: [createStatsEmbed(interaction.client)], components: [row] });
            }
        });

        collector.on('end', () => {
            const disabled = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('btn_yenile_stats').setLabel('Yenile').setStyle(ButtonStyle.Secondary).setEmoji('🔄').setDisabled(true)
            );
            interaction.editReply({ components: [disabled] }).catch(() => {});
        });
    },
};