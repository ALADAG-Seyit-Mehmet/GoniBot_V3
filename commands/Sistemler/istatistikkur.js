const { SlashCommandBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const db = require('croxydb');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('istatistik-kur')
        .setDescription('Sunucu istatistik panelini (Toplam/Aktif Üye) kurar.'),

    async execute(interaction) {
        // Yetki Kontrolü
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) 
            return interaction.reply({ content: '❌ Sadece Yöneticiler kullanabilir.', ephemeral: true });

        await interaction.reply("🔄 İstatistik paneli kuruluyor...");

        try {
            const guild = interaction.guild;

            // 1. Kategoriyi Oluştur
            const category = await guild.channels.create({
                name: '📊 SUNUCU İSTATİSTİKLERİ',
                type: ChannelType.GuildCategory,
                permissionOverwrites: [{ 
                    id: guild.id, 
                    deny: [PermissionsBitField.Flags.Connect] // Kimse bağlanamasın (Sadece görünsün)
                }]
            });

            // 2. Verileri Hesapla
            const toplam = guild.memberCount;
            const cevrimici = guild.members.cache.filter(m => !m.user.bot && m.presence && m.presence.status !== 'offline').size;
            const sesli = guild.members.cache.filter(m => m.voice.channel).size;

            // 3. Kanalları Oluştur
            const chTotal = await guild.channels.create({ 
                name: `👥 Toplam: ${toplam}`, 
                type: ChannelType.GuildVoice, 
                parent: category.id 
            });

            const chOnline = await guild.channels.create({ 
                name: `🟢 Çevrim İçi: ${cevrimici}`, 
                type: ChannelType.GuildVoice, 
                parent: category.id 
            });

            const chVoice = await guild.channels.create({ 
                name: `🔊 Sesli: ${sesli}`, 
                type: ChannelType.GuildVoice, 
                parent: category.id 
            });

            // 4. Veritabanına Kaydet (Otomatik güncelleme için)
            db.set(`statCategory_${guild.id}`, category.id);
            db.set(`statTotal_${guild.id}`, chTotal.id);
            db.set(`statOnline_${guild.id}`, chOnline.id);
            db.set(`statVoice_${guild.id}`, chVoice.id);

            await interaction.editReply("✅ **Başarılı!** İstatistik paneli sunucunun en üstüne kuruldu.");

        } catch (error) {
            console.log(error);
            await interaction.editReply("❌ **Hata:** Kurulum yapılamadı. Botun 'Kanalları Yönet' yetkisi olduğundan emin ol.");
        }
    }
};