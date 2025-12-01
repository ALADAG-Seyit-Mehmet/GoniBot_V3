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
        // SENARYO 1: KULLANICI PROFİLİ (Değişmedi)
        // ====================================================
        if (targetUser) {
            const member = interaction.guild.members.cache.get(targetUser.id);
            const para = db.fetch(`para_${targetUser.id}`) || 0;
            const xp = db.fetch(`xp_${targetUser.id}`) || 0;
            const klan = db.fetch(`klan_${targetUser.id}`) || "Yok";
            const partnerID = db.fetch(`partner_${targetUser.id}`);
            const partner = partnerID ? `<@${partnerID}>` : "Bekar";
            const hapis = db.fetch(`hapis_${targetUser.id}`) ? "🔒 Hapiste" : "Serbest";

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
                .addFields(
                    { name: '📅 Tarihçesi', value: `Sunucuya: <t:${parseInt(member.joinedTimestamp / 1000)}:R>\nDiscord'a: <t:${parseInt(targetUser.createdTimestamp / 1000)}:D>`, inline: true },
                    { name: '⚔️ RPG & Ekonomi', value: `💰 **${para} TL** | ✨ **${xp} XP**\n🏰 Klan: **${klan}** | 💍 **${partner}**`, inline: false },
                    { name: `🎭 Roller`, value: roles, inline: false }
                );

            return interaction.reply({ embeds: [embed] });
        }

        // ====================================================
        // SENARYO 2: BOT İSTATİSTİĞİ (Yenileme Özelliği Eklendi)
        // ====================================================
        
        // İstatistik Oluşturma Fonksiyonu (Tekrar tekrar kullanacağız)
        const getStatsEmbed = (client) => {
            const uptime = process.uptime();
            const days = Math.floor(uptime / 86400);
            const hours = Math.floor(uptime / 3600) % 24;
            const minutes = Math.floor(uptime / 60) % 60;
            
            return new EmbedBuilder()
                .setTitle('🤖 GoniBot Sistem Durumu')
                .addFields(
                    { name: '💻 Sunucu', value: `${client.guilds.cache.size}`, inline: true },
                    { name: '👥 Kullanıcı', value: `${client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)}`, inline: true },
                    { name: '🏓 Ping', value: `**${client.ws.ping}ms**`, inline: true },
                    { name: '🧠 RAM', value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`, inline: true },
                    { name: '⏱️ Süre', value: `${days}g ${hours}s ${minutes}dk`, inline: true },
                    { name: '📚 Kütüphane', value: `Discord.js v${version}`, inline: true }
                )
                .setColor('Blurple')
                .setThumbnail(client.user.displayAvatarURL())
                .setFooter({ text: `Son Güncelleme: ${new Date().toLocaleTimeString()}` });
        };

        // Sadece Yenile Butonu
        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('btn_yenile_stats').setLabel('Verileri Yenile').setStyle(ButtonStyle.Secondary).setEmoji('🔄')
        );

        // Mesajı Gönder
        const response = await interaction.reply({ embeds: [getStatsEmbed(interaction.client)], components: [row], fetchReply: true });

        // BUTON DİNLEYİCİSİ (Collector)
        const collector = response.createMessageComponentCollector({ time: 60000 }); // 60 Saniye aktif kalır

        collector.on('collect', async i => {
            if (i.customId === 'btn_yenile_stats') {
                // Sadece butona basan kişi yenileyebilsin istersen:
                // if(i.user.id !== interaction.user.id) return i.reply({content: "Bunu sen yapamazsın.", ephemeral: true});
                
                await i.update({ embeds: [getStatsEmbed(interaction.client)], components: [row] });
            }
        });

        collector.on('end', () => {
            // Süre bitince butonu devre dışı bırak
            const disabledRow = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId('btn_yenile_stats').setLabel('Süre Doldu').setStyle(ButtonStyle.Secondary).setEmoji('🔄').setDisabled(true)
            );
            interaction.editReply({ components: [disabledRow] }).catch(() => {});
        });
    },
};