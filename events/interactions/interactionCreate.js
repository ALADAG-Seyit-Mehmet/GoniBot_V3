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
        //              TICKET (DESTEK) SİSTEMİ
        // ====================================================
        
        if (interaction.isButton()) {
            // 1. TICKET AÇMA
            if (interaction.customId === 'ticket_ac') {
                if (interaction.channel.name.includes('ticket-')) return interaction.reply({ content: 'Zaten ticket kanalındasın!', ephemeral: true });
                
                // Kanalı Oluştur
                const channel = await interaction.guild.channels.create({
                    name: `ticket-${interaction.user.username}`,
                    type: ChannelType.GuildText,
                    permissionOverwrites: [
                        { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] }, // Herkesi engelle
                        { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }, // Kullanıcıyı al
                        { id: client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] } // Botu al
                    ]
                });

                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('ticket_kapat').setLabel('Talebi Kapat').setStyle(ButtonStyle.Danger).setEmoji('🔒')
                );

                const embed = new EmbedBuilder()
                    .setTitle(`👋 Merhaba ${interaction.user.username}`)
                    .setDescription('Destek ekibi birazdan seninle ilgilenecek.\nİşin bitince aşağıdaki butonla kapatabilirsin.')
                    .setColor('Green');

                await channel.send({ content: `<@${interaction.user.id}>`, embeds: [embed], components: [row] });
                await interaction.reply({ content: `✅ Talep açıldı: ${channel}`, ephemeral: true });
            }

            // 2. TICKET KAPATMA
            if (interaction.customId === 'ticket_kapat') {
                await interaction.reply('🔒 Kanal 5 saniye içinde siliniyor...');
                setTimeout(() => interaction.channel.delete().catch(() => {}), 5000);
            }
        }

        // ====================================================
        //              PANEL & DİĞER BUTONLAR
        // ====================================================

        // 1. ANA MENÜ SEÇİMLERİ (Dropdown)
        if (interaction.isStringSelectMenu() && interaction.customId === 'panel_ana_menu') {
            const secim = interaction.values[0];

            if (secim === 'menu_koruma') {
                const k_kufur = db.fetch(`kufurEngel_${interaction.guild.id}`);
                const k_reklam = db.fetch(`reklamEngel_${interaction.guild.id}`);
                const k_link = db.fetch(`linkEngel_${interaction.guild.id}`);
                const embed = new EmbedBuilder().setTitle('🛡️ Koruma Yönetimi').setDescription('Aktif etmek istediklerinizi seçin.').setColor('Red');
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('btn_kufur').setLabel('Küfür').setStyle(k_kufur ? ButtonStyle.Success : ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId('btn_reklam').setLabel('Reklam').setStyle(k_reklam ? ButtonStyle.Success : ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId('btn_link').setLabel('Link').setStyle(k_link ? ButtonStyle.Success : ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId('btn_geri').setLabel('Geri').setStyle(ButtonStyle.Danger)
                );
                await interaction.update({ embeds: [embed], components: [row] });
            }

            if (secim === 'menu_sistem') {
                const embed = new EmbedBuilder().setTitle('⚙️ Sistemler').setColor('Blue');
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('sys_log').setLabel('Log Kanalı').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('sys_global').setLabel('Global Chat').setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId('btn_geri').setLabel('Geri').setStyle(ButtonStyle.Danger)
                );
                await interaction.update({ embeds: [embed], components: [row] });
            }

            if (secim === 'menu_mod') {
                const embed = new EmbedBuilder().setTitle('🛠️ Moderasyon').setColor('Orange');
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId('mod_sil').setLabel('Temizle (20)').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId('mod_kilit').setLabel('Kilitle').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId('mod_ac').setLabel('Aç').setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId('btn_geri').setLabel('Geri').setStyle(ButtonStyle.Danger)
                );
                await interaction.update({ embeds: [embed], components: [row] });
            }
        }

        // 2. BUTON İŞLEMLERİ
        if (interaction.isButton()) {
            // Geri Dön
            if (interaction.customId === 'btn_geri') {
                const embed = new EmbedBuilder().setTitle('🎛️ Kontrol Merkezi').setColor('DarkVividPink');
                const menu = new StringSelectMenuBuilder().setCustomId('panel_ana_menu').setPlaceholder('Kategori seç...').addOptions(
                    { label: 'Koruma', value: 'menu_koruma', emoji: '🛡️' },
                    { label: 'Sistemler', value: 'menu_sistem', emoji: '⚙️' },
                    { label: 'Moderasyon', value: 'menu_mod', emoji: '🔨' }
                );
                await interaction.update({ embeds: [embed], components: [new ActionRowBuilder().addComponents(menu)] });
            }

            // Koruma Toggle
            if (['btn_kufur', 'btn_reklam', 'btn_link'].includes(interaction.customId)) {
                const tip = interaction.customId.replace('btn_', '') + 'Engel';
                const durum = db.fetch(`${tip}_${interaction.guild.id}`);
                if (durum) db.delete(`${tip}_${interaction.guild.id}`); else db.set(`${tip}_${interaction.guild.id}`, true);
                const yeniDurum = !durum;
                const newRow = ActionRowBuilder.from(interaction.message.components[0]);
                const btnIndex = newRow.components.findIndex(b => b.data.custom_id === interaction.customId);
                newRow.components[btnIndex].setStyle(yeniDurum ? ButtonStyle.Success : ButtonStyle.Secondary);
                await interaction.update({ components: [newRow] });
            }

            // Kanal Seçiciler
            if (interaction.customId === 'sys_log') {
                const row = new ActionRowBuilder().addComponents(new ChannelSelectMenuBuilder().setCustomId('set_log_channel').setChannelTypes(ChannelType.GuildText));
                await interaction.reply({ content: 'Log kanalı seç:', components: [row], ephemeral: true });
            }
            if (interaction.customId === 'sys_global') {
                const row = new ActionRowBuilder().addComponents(new ChannelSelectMenuBuilder().setCustomId('set_global_channel').setChannelTypes(ChannelType.GuildText));
                await interaction.reply({ content: 'Global chat kanalı seç:', components: [row], ephemeral: true });
            }

            // Moderasyon
            if (interaction.customId === 'mod_sil') { await interaction.channel.bulkDelete(20, true); interaction.reply({content:'Temizlendi.', ephemeral:true}); }
            if (interaction.customId === 'mod_kilit') { await interaction.channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: false }); interaction.reply({content:'Kilitlendi.', ephemeral:true}); }
            if (interaction.customId === 'mod_ac') { await interaction.channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: true }); interaction.reply({content:'Açıldı.', ephemeral:true}); }
            
            // Boss Vur
            if (interaction.customId === 'boss_vur') {
                let hp = db.fetch(`boss_${interaction.message.id}`);
                if(hp <= 0) return interaction.reply({content:"Öldü!", ephemeral: true});
                hp -= 100; db.set(`boss_${interaction.message.id}`, hp);
                if(hp <= 0) { interaction.update({content: `🏆 Boss öldü! ${interaction.user} bitirdi!`, components: []}); db.add(`para_${interaction.user.id}`, 5000); }
                else interaction.reply({content: `Vurdun! Kalan: ${hp}`, ephemeral: true});
            }
        }

        // 3. KANAL KAYIT
        if (interaction.isChannelSelectMenu()) {
            if (interaction.customId === 'set_log_channel') { db.set(`logKanal_${interaction.guild.id}`, interaction.values[0]); interaction.update({content:'Log ayarlandı.', components:[]}); }
            if (interaction.customId === 'set_global_channel') { db.set(`globalKanal_${interaction.guild.id}`, interaction.values[0]); interaction.update({content:'Global ayarlandı.', components:[]}); }
        }
    }
};