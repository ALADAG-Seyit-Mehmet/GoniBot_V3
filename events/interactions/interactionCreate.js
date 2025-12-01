const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ChannelSelectMenuBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const db = require('croxydb');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {

        // --- HAPİS KONTROLÜ ---
        if (interaction.isChatInputCommand()) {
            const hapis = db.fetch(`hapis_${interaction.user.id}`);
            if (hapis) {
                if (Date.now() < hapis) return interaction.reply({ content: "🔒 Hapistesin! Komut kullanamazsın.", ephemeral: true });
                else db.delete(`hapis_${interaction.user.id}`);
            }
        }

        // --- KOMUT ÇALIŞTIRICI ---
        if (interaction.isChatInputCommand() || interaction.isUserContextMenuCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (command) try { await command.execute(interaction); } catch (e) { console.error(e); }
        }

        // ====================================================
        //              GELİŞMİŞ PANEL MANTIĞI
        // ====================================================

        // 1. ANA MENÜ SEÇİMLERİ (Dropdown)
        if (interaction.isStringSelectMenu() && interaction.customId === 'panel_ana_menu') {
            const secim = interaction.values[0];

            // A) KORUMA MENÜSÜ
            if (secim === 'menu_koruma') {
                const k_kufur = db.fetch(`kufurEngel_${interaction.guild.id}`);
                const k_reklam = db.fetch(`reklamEngel_${interaction.guild.id}`);
                const k_link = db.fetch(`linkEngel_${interaction.guild.id}`);

                const embed = new EmbedBuilder().setTitle('🛡️ Koruma Yönetimi').setDescription('Aktif etmek istediğiniz korumaları yeşil yapın.').setColor('Red');
                
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('btn_kufur').setLabel('Küfür Engel').setStyle(k_kufur ? ButtonStyle.Success : ButtonStyle.Secondary).setEmoji('🤬'),
                    new ButtonBuilder().setCustomId('btn_reklam').setLabel('Reklam Engel').setStyle(k_reklam ? ButtonStyle.Success : ButtonStyle.Secondary).setEmoji('📢'),
                    new ButtonBuilder().setCustomId('btn_link').setLabel('Link Engel').setStyle(k_link ? ButtonStyle.Success : ButtonStyle.Secondary).setEmoji('🔗'),
                    new ButtonBuilder().setCustomId('btn_geri').setLabel('Ana Menü').setStyle(ButtonStyle.Danger).setEmoji('🔙')
                );
                
                await interaction.update({ embeds: [embed], components: [row] });
            }

            // B) SİSTEM MENÜSÜ
            if (secim === 'menu_sistem') {
                const embed = new EmbedBuilder().setTitle('⚙️ Sistem Kurulumu').setDescription('Aşağıdaki butonlarla kanalları ayarlayın.').setColor('Blue');
                
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('sys_log').setLabel('Log Kanalı').setStyle(ButtonStyle.Primary).setEmoji('📜'),
                    new ButtonBuilder().setCustomId('sys_global').setLabel('Global Chat').setStyle(ButtonStyle.Primary).setEmoji('🌐'),
                    new ButtonBuilder().setCustomId('sys_otorol').setLabel('Otorol (Yakında)').setStyle(ButtonStyle.Secondary).setEmoji('🤖'),
                    new ButtonBuilder().setCustomId('btn_geri').setLabel('Ana Menü').setStyle(ButtonStyle.Danger).setEmoji('🔙')
                );
                
                await interaction.update({ embeds: [embed], components: [row] });
            }

            // C) MODERASYON MENÜSÜ
            if (secim === 'menu_mod') {
                const embed = new EmbedBuilder().setTitle('🛠️ Hızlı Moderasyon').setDescription('Kanal üzerinde işlem yapın.').setColor('Orange');
                
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('mod_sil').setLabel('Temizle (20)').setStyle(ButtonStyle.Secondary).setEmoji('🧹'),
                    new ButtonBuilder().setCustomId('mod_kilit').setLabel('Kanalı Kilitle').setStyle(ButtonStyle.Secondary).setEmoji('🔒'),
                    new ButtonBuilder().setCustomId('mod_ac').setLabel('Kanalı Aç').setStyle(ButtonStyle.Secondary).setEmoji('🔓'),
                    new ButtonBuilder().setCustomId('btn_geri').setLabel('Ana Menü').setStyle(ButtonStyle.Danger).setEmoji('🔙')
                );
                
                await interaction.update({ embeds: [embed], components: [row] });
            }
        }

        // 2. BUTON İŞLEMLERİ (Tıklamalar)
        if (interaction.isButton()) {
            
            // --- GERİ DÖN ---
            if (interaction.customId === 'btn_geri') {
                const embed = new EmbedBuilder().setTitle('🎛️ Kontrol Merkezi').setDescription('Kategori seçiniz:').setColor('DarkVividPink');
                const menu = new StringSelectMenuBuilder().setCustomId('panel_ana_menu').setPlaceholder('Bir kategori seçin...').addOptions(
                    { label: 'Koruma', value: 'menu_koruma', emoji: '🛡️' },
                    { label: 'Sistemler', value: 'menu_sistem', emoji: '⚙️' },
                    { label: 'Moderasyon', value: 'menu_mod', emoji: '🔨' }
                );
                await interaction.update({ embeds: [embed], components: [new ActionRowBuilder().addComponents(menu)] });
            }

            // --- KORUMA AÇ/KAPA (Toggle) ---
            if (['btn_kufur', 'btn_reklam', 'btn_link'].includes(interaction.customId)) {
                const tip = interaction.customId.replace('btn_', '') + 'Engel'; // Örn: kufurEngel
                const durum = db.fetch(`${tip}_${interaction.guild.id}`);
                
                if (durum) db.delete(`${tip}_${interaction.guild.id}`);
                else db.set(`${tip}_${interaction.guild.id}`, true);

                // Buton rengini güncellemek için menüyü yeniden çiziyoruz (Basit yenileme)
                const yeniDurum = !durum;
                const newRow = ActionRowBuilder.from(interaction.message.components[0]);
                const btnIndex = newRow.components.findIndex(b => b.data.custom_id === interaction.customId);
                newRow.components[btnIndex].setStyle(yeniDurum ? ButtonStyle.Success : ButtonStyle.Secondary);
                
                await interaction.update({ components: [newRow] });
            }

            // --- SİSTEM KANAL SEÇİMİ AÇMA ---
            if (interaction.customId === 'sys_log') {
                const row = new ActionRowBuilder().addComponents(new ChannelSelectMenuBuilder().setCustomId('set_log_channel').setChannelTypes(ChannelType.GuildText).setPlaceholder('Log Kanalını Seç'));
                await interaction.reply({ content: '📜 Loglar nereye aksın?', components: [row], ephemeral: true });
            }
            if (interaction.customId === 'sys_global') {
                const row = new ActionRowBuilder().addComponents(new ChannelSelectMenuBuilder().setCustomId('set_global_channel').setChannelTypes(ChannelType.GuildText).setPlaceholder('Global Chat Kanalını Seç'));
                await interaction.reply({ content: '🌐 Global Chat hangi kanal olsun?', components: [row], ephemeral: true });
            }

            // --- MODERASYON İŞLEMLERİ ---
            if (interaction.customId === 'mod_sil') {
                await interaction.channel.bulkDelete(20, true);
                await interaction.reply({ content: '🧹 20 mesaj süpürüldü.', ephemeral: true });
            }
            if (interaction.customId === 'mod_kilit') {
                await interaction.channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: false });
                await interaction.reply({ content: '🔒 Kanal kilitlendi.', ephemeral: true });
            }
            if (interaction.customId === 'mod_ac') {
                await interaction.channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: true });
                await interaction.reply({ content: '🔓 Kanal açıldı.', ephemeral: true });
            }
        }

        // 3. KANAL SEÇİM SONUÇLARI
        if (interaction.isChannelSelectMenu()) {
            if (interaction.customId === 'set_log_channel') {
                db.set(`logKanal_${interaction.guild.id}`, interaction.values[0]);
                await interaction.update({ content: `✅ Log kanalı <#${interaction.values[0]}> olarak ayarlandı!`, components: [] });
            }
            if (interaction.customId === 'set_global_channel') {
                db.set(`globalKanal_${interaction.guild.id}`, interaction.values[0]);
                await interaction.update({ content: `✅ Global Chat <#${interaction.values[0]}> kanalına bağlandı!`, components: [] });
            }
        }
    }
};