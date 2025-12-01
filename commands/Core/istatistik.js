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
        // SENARYO 1: KULLANICI PROFİLİ (User Info + RPG Stats)
        // ====================================================
        if (targetUser) {
            const member = interaction.guild.members.cache.get(targetUser.id);
            
            // Veritabanı Verileri
            const para = db.fetch(`para_${targetUser.id}`) || 0;
            const xp = db.fetch(`xp_${targetUser.id}`) || 0;
            const klan = db.fetch(`klan_${targetUser.id}`) || "Yok";
            const partnerID = db.fetch(`partner_${targetUser.id}`);
            const partner = partnerID ? `<@${partnerID}>` : "Bekar";
            const hapis = db.fetch(`hapis_${targetUser.id}`) ? "🔒 Hapiste" : "Serbest";

            // Rolleri Al (Everyone hariç)
            const roles = member.roles.cache
                .filter(r => r.id !== interaction.guild.id)
                .sort((a, b) => b.position - a.position)
                .map(r => r)
                .slice(0, 10) // İlk 10 rolü göster
                .join(", ") || "Rolü Yok";

            const embed = new EmbedBuilder()
                .setAuthor({ name: targetUser.tag, iconURL: targetUser.displayAvatarURL() })
                .setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 512 }))
                .setColor(member.displayHexColor)
                .addFields(
                    { name: '🆔 Kimlik', value: `\`${targetUser.id}\``, inline: true },
                    { name: '📅 Katılım Tarihi', value: `<t:${parseInt(member.joinedTimestamp / 1000)}:R>`, inline: true },
                    { name: '📆 Hesap Tarihi', value: `<t:${parseInt(targetUser.createdTimestamp / 1000)}:D>`, inline: true },
                    
                    { name: '⚔️ RPG Durumu', value: `
                    💰 **Para:** ${para} TL
                    ✨ **XP:** ${xp}
                    🏰 **Klan:** ${klan}
                    💍 **Durum:** ${partner}
                    ⚖️ **Sicil:** ${hapis}
                    `, inline: false },

                    { name: `🎭 Roller (${member.roles.cache.size - 1})`, value: roles, inline: false }
                )
                .setFooter({ text: `GoniBot v3.0 • Profil Sistemi` });

            return interaction.reply({ embeds: [embed] });
        }

        // ====================================================
        // SENARYO 2: GENEL BOT İSTATİSTİĞİ (Bot Info)
        // ====================================================
        
        const uptime = process.uptime();
        const days = Math.floor(uptime / 86400);
        const hours = Math.floor(uptime / 3600) % 24;
        const minutes = Math.floor(uptime / 60) % 60;
        
        const embed = new EmbedBuilder()
            .setTitle('🤖 GoniBot Sistem Verileri')
            .setDescription('Goni tarafından geliştirilen üst düzey yönetim ve eğlence botu.')
            .addFields(
                { name: '👑 Geliştirici', value: 'Goni', inline: true },
                { name: '🏓 Gecikme (Ping)', value: `**${interaction.client.ws.ping}ms**`, inline: true },
                { name: '⏱️ Çalışma Süresi', value: `${days}g ${hours}s ${minutes}dk`, inline: true },
                
                { name: '📊 İstatistikler', value: `
                💻 **Sunucu:** ${interaction.client.guilds.cache.size}
                👥 **Kullanıcı:** ${interaction.client.guilds.cache.reduce((a, b) => a + b.memberCount, 0)}
                📺 **Kanal:** ${interaction.client.channels.cache.size}
                `, inline: true },

                { name: '⚙️ Altyapı', value: `
                🧠 **RAM:** ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB
                📚 **Discord.js:** v${version}
                🟢 **Node.js:** ${process.version}
                `, inline: true }
            )
            .setColor('DarkButNotBlack')
            .setThumbnail(interaction.client.user.displayAvatarURL());

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setLabel('Destek Sunucusu').setStyle(ButtonStyle.Link).setURL('https://discord.gg/destek'), // Buraya kendi linkini koyabilirsin
            new ButtonBuilder().setCustomId('btn_yenile').setLabel('Yenile').setStyle(ButtonStyle.Secondary).setEmoji('🔄')
        );

        await interaction.reply({ embeds: [embed], components: [row] });
    },
};