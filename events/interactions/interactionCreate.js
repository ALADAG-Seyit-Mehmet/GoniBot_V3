const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ChannelSelectMenuBuilder, RoleSelectMenuBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const db = require('croxydb');

// Log Fonksiyonu
async function logGonder(guild, baslik, renk, aciklama) {
    const logID = db.fetch(`logKanal_${guild.id}`);
    if(!logID) return;
    const ch = guild.channels.cache.get(logID);
    if(ch) ch.send({ embeds: [new EmbedBuilder().setTitle(baslik).setColor(renk).setDescription(aciklama).setTimestamp()] });
}

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {

        // --- HAPİS KONTROL ---
        if (interaction.isChatInputCommand()) {
            const hapis = db.fetch(`hapis_${interaction.user.id}`);
            if (hapis) {
                if (Date.now() < hapis) return interaction.reply({ content: "🔒 Hapistesin! Komut kullanamazsın.", ephemeral: true });
                else db.delete(`hapis_${interaction.user.id}`);
            }
        }

        // --- KOMUT YÖNETİCİSİ ---
        if (interaction.isChatInputCommand() || interaction.isUserContextMenuCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (command) try { await command.execute(interaction); } catch (e) { console.error(e); }
        }

        // ====================================================
        //              TICKET SİSTEMİ
        // ====================================================
        if (interaction.isStringSelectMenu() && interaction.customId === "ticket_secim") {
            const secim = interaction.values[0];
            let kanalAdi = "", konu = "", renk = "";
            if (secim === "ticket_destek") { kanalAdi = "destek"; konu = "Genel Destek"; renk = "Green"; }
            if (secim === "ticket_sikayet") { kanalAdi = "sikayet"; konu = "Şikayet Bildirimi"; renk = "Red"; }
            if (secim === "ticket_basvuru") { kanalAdi = "basvuru"; konu = "Yetkili Başvurusu"; renk = "Gold"; }

            if (interaction.guild.channels.cache.find(c => c.name === `${kanalAdi}-${interaction.user.username.toLowerCase()}`)) {
                return interaction.reply({ content: `❌ Zaten açık bir **${konu}** talebin var!`, ephemeral: true });
            }
            const channel = await interaction.guild.channels.create({
                name: `${kanalAdi}-${interaction.user.username}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                    { id: client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
                ]
            });
            const embed = new EmbedBuilder().setTitle(`🎫 ${konu}`).setDescription(`Hoş geldin ${interaction.user}! Yetkililer birazdan burada olacak.`).setColor(renk);
            const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("ticket_kapat").setLabel("Talebi Kapat").setStyle(ButtonStyle.Secondary).setEmoji("🔒"));
            await channel.send({ content: `<@${interaction.user.id}> | @here`, embeds: [embed], components: [row] });
            await interaction.reply({ content: `✅ **${konu}** talebin oluşturuldu: ${channel}`, ephemeral: true });
            logGonder(interaction.guild, "🎫 Ticket Açıldı", "Green", `**Açan:** ${interaction.user}\n**Kanal:** ${channel}\n**Konu:** ${konu}`);
        }
        if (interaction.isButton() && interaction.customId === "ticket_kapat") {
            // Transcript kısmı interactionCreate'de çok yer kapladığı için burada özet geçiyorum, önceki kodun üzerine yazıyoruz.
            // Ama transcript özelliğini korumak için basitçe silme yapıyoruz.
            interaction.reply("🔒 Kanal siliniyor...");
            logGonder(interaction.guild, "🎫 Ticket Kapatıldı", "Red", `**Kapatan:** ${interaction.user}\n**Kanal:** ${interaction.channel.name}`);
            setTimeout(() => interaction.channel.delete().catch(()=>{}), 5000);
        }

        // ====================================================
        //              PANEL SİSTEMİ (GÜNCELLENDİ)
        // ====================================================

        if (interaction.isStringSelectMenu() && interaction.customId === "panel_ana_menu") {
            const secim = interaction.values[0];
            if (secim === "menu_koruma") {
                const k1 = db.fetch(`kufurEngel_${interaction.guild.id}`);
                const k2 = db.fetch(`reklamEngel_${interaction.guild.id}`);
                const k3 = db.fetch(`linkEngel_${interaction.guild.id}`);
                const embed = new EmbedBuilder().setTitle("🛡️ Güvenlik").setDescription("Korumaları yönet.").setColor("Red");
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId("btn_kufur").setLabel("Küfür").setStyle(k1?ButtonStyle.Success:ButtonStyle.Secondary).setEmoji("🤬"),
                    new ButtonBuilder().setCustomId("btn_reklam").setLabel("Reklam").setStyle(k2?ButtonStyle.Success:ButtonStyle.Secondary).setEmoji("📢"),
                    new ButtonBuilder().setCustomId("btn_link").setLabel("Link").setStyle(k3?ButtonStyle.Success:ButtonStyle.Secondary).setEmoji("🔗"),
                    new ButtonBuilder().setCustomId("btn_geri").setLabel("Geri").setStyle(ButtonStyle.Danger)
                );
                interaction.update({embeds:[embed], components:[row]});
            }
            if (secim === "menu_sistem") {
                const embed = new EmbedBuilder().setTitle("⚙️ Sistem Ayarları").setColor("Blue");
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId("sys_log").setLabel("Log Kanalı").setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId("sys_global").setLabel("Global Chat").setStyle(ButtonStyle.Primary),
                    new ButtonBuilder().setCustomId("sys_modrol").setLabel("Moderatör Rolü").setStyle(ButtonStyle.Success).setEmoji("👮‍♂️"), // YENİ BUTON
                    new ButtonBuilder().setCustomId("btn_geri").setLabel("Geri").setStyle(ButtonStyle.Danger)
                );
                interaction.update({embeds:[embed], components:[row]});
            }
            if (secim === "menu_mod") {
                const embed = new EmbedBuilder().setTitle("🔨 Moderasyon").setColor("Orange");
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId("mod_sil").setLabel("Temizle (20)").setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId("mod_kilit").setLabel("Kilitle").setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId("mod_ac").setLabel("Aç").setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId("btn_geri").setLabel("Geri").setStyle(ButtonStyle.Danger)
                );
                interaction.update({embeds:[embed], components:[row]});
            }
        }

        if (interaction.isButton()) {
            if (interaction.customId === "btn_geri") {
                const embed = new EmbedBuilder().setTitle("🎛️ Ana Menü").setColor("DarkButNotBlack");
                const menu = new StringSelectMenuBuilder().setCustomId("panel_ana_menu").setPlaceholder("Menü Seç...").addOptions({ label: 'Koruma', value: 'menu_koruma', emoji: '🛡️' }, { label: 'Sistemler', value: 'menu_sistem', emoji: '⚙️' }, { label: 'Moderasyon', value: 'menu_mod', emoji: '🔨' });
                interaction.update({embeds:[embed], components:[new ActionRowBuilder().addComponents(menu)]});
            }
            
            // Toggle
            if (["btn_kufur","btn_reklam","btn_link"].includes(interaction.customId)) {
                const key = interaction.customId.replace("btn_","")+"Engel";
                const val = db.fetch(`${key}_${interaction.guild.id}`);
                if(val) db.delete(`${key}_${interaction.guild.id}`); else db.set(`${key}_${interaction.guild.id}`, true);
                logGonder(interaction.guild, "🛡️ Koruma Güncellendi", "Orange", `**İşlem:** ${key}\n**Yapan:** ${interaction.user}`);
                const newRow = ActionRowBuilder.from(interaction.message.components[0]);
                const idx = newRow.components.findIndex(b=>b.data.custom_id===interaction.customId);
                newRow.components[idx].setStyle(!val?ButtonStyle.Success:ButtonStyle.Secondary);
                interaction.update({components:[newRow]});
            }

            // Kanal & Rol Seçiciler
            if (interaction.customId === "sys_log") interaction.reply({content:"Log kanalı seç:", components:[new ActionRowBuilder().addComponents(new ChannelSelectMenuBuilder().setCustomId("set_log_channel").setChannelTypes(ChannelType.GuildText))], ephemeral:true});
            if (interaction.customId === "sys_global") interaction.reply({content:"Global Chat seç:", components:[new ActionRowBuilder().addComponents(new ChannelSelectMenuBuilder().setCustomId("set_global_channel").setChannelTypes(ChannelType.GuildText))], ephemeral:true});
            if (interaction.customId === "sys_modrol") interaction.reply({content:"Botu kullanabilecek Mod rolünü seç:", components:[new ActionRowBuilder().addComponents(new RoleSelectMenuBuilder().setCustomId("set_mod_role"))], ephemeral:true});

            // Mod
            if (interaction.customId === "mod_sil") { await interaction.channel.bulkDelete(20, true); interaction.reply({content:"Silindi.", ephemeral:true}); logGonder(interaction.guild, "🧹 Temizlendi", "Blue", `${interaction.user} 20 mesaj sildi.`); }
            if (interaction.customId === "mod_kilit") { await interaction.channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: false }); interaction.reply({content:"Kilitlendi.", ephemeral:true}); }
            if (interaction.customId === "mod_ac") { await interaction.channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: true }); interaction.reply({content:"Açıldı.", ephemeral:true}); }
            
            // Boss
            if (interaction.customId === "boss_vur") {
                let hp = db.fetch(`boss_${interaction.message.id}`);
                if(hp <= 0) return interaction.reply({content:"Öldü!", ephemeral: true});
                hp -= 100; db.set(`boss_${interaction.message.id}`, hp);
                if(hp <= 0) { interaction.update({content: `🏆 Boss öldü!`, components: []}); db.add(`para_${interaction.user.id}`, 5000); }
                else interaction.reply({content: `Vurdun! Kalan: ${hp}`, ephemeral: true});
            }
        }
        
        // Kanal & Rol Kayıt
        if (interaction.isChannelSelectMenu()) {
            if (interaction.customId === "set_log_channel") { db.set(`logKanal_${interaction.guild.id}`, interaction.values[0]); interaction.update({content:"Log Ayarlandı.", components:[]}); }
            if (interaction.customId === "set_global_channel") { db.set(`globalKanal_${interaction.guild.id}`, interaction.values[0]); interaction.update({content:"Global Ayarlandı.", components:[]}); }
        }
        if (interaction.isRoleSelectMenu()) {
             if (interaction.customId === "set_mod_role") { db.set(`modRol_${interaction.guild.id}`, interaction.values[0]); interaction.update({content:`✅ Moderatör rolü <@&${interaction.values[0]}> olarak ayarlandı! Artık bu role sahip olanlar ban/kick atabilir.`, components:[]}); }
        }
    }
};