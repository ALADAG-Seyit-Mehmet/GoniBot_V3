const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ChannelSelectMenuBuilder, RoleSelectMenuBuilder, ChannelType, PermissionsBitField, AttachmentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('croxydb');

// --- YARDIMCI FONKSİYON: LOG GÖNDERME ---
async function logGonder(guild, baslik, renk, aciklama) {
    const logID = db.fetch(`logKanal_${guild.id}`);
    if(!logID) return;
    const ch = guild.channels.cache.get(logID);
    if(ch) ch.send({ embeds: [new EmbedBuilder().setTitle(baslik).setColor(renk).setDescription(aciklama).setTimestamp()] });
}

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {

        // ====================================================
        //              1. GENEL KONTROLLER
        // ====================================================

        // Hapis Kontrolü (Komutlar İçin)
        if (interaction.isChatInputCommand()) {
            const hapis = db.fetch(`hapis_${interaction.user.id}`);
            if (hapis) {
                if (Date.now() < hapis) return interaction.reply({ content: "🔒 **Hapistesin!** Cezan bitene kadar komut kullanamazsın.", ephemeral: true });
                else db.delete(`hapis_${interaction.user.id}`);
            }
            
            // Komutu Çalıştır
            const command = client.commands.get(interaction.commandName);
            if (command) {
                try { await command.execute(interaction); } 
                catch (e) { console.error(e); interaction.reply({content:"Komut hatası.", ephemeral:true}).catch(()=>{}); }
            }
        }

        // ====================================================
        //              2. BORSA SİSTEMİ (BUTON & MODAL)
        // ====================================================
        
        // Borsa Butonları (Al/Sat/Yenile)
        if (interaction.isButton()) {
            if (interaction.customId === "btn_borsa_al" || interaction.customId === "btn_borsa_sat") {
                const islem = interaction.customId === "btn_borsa_al" ? "alim" : "satis";
                const baslik = islem === "alim" ? "Varlık Satın Al" : "Varlık Sat";
                
                const modal = new ModalBuilder().setCustomId(`modal_borsa_${islem}`).setTitle(baslik);
                
                const input1 = new TextInputBuilder().setCustomId('sembol').setLabel("Varlık (BTC, USD, GLD, GNI)").setStyle(TextInputStyle.Short).setPlaceholder("Örn: BTC").setRequired(true);
                const input2 = new TextInputBuilder().setCustomId('adet').setLabel("Miktar").setStyle(TextInputStyle.Short).setPlaceholder("Örn: 10").setRequired(true);
                
                modal.addComponents(new ActionRowBuilder().addComponents(input1), new ActionRowBuilder().addComponents(input2));
                await interaction.showModal(modal);
            }
            
            if (interaction.customId === "btn_yenile_borsa") {
                await interaction.deferReply({ ephemeral: true });
                const p = db.fetch(`para_${interaction.user.id}`) || 0;
                await interaction.editReply(`🔄 **Güncel Bakiye:** ${p.toLocaleString()} TL\n*Piyasa her dakika güncellenir.*`);
            }
        }

        // Borsa Modal Sonucu (İşlem Yapma)
        if (interaction.isModalSubmit() && interaction.customId.startsWith('modal_borsa_')) {
            await interaction.deferReply({ ephemeral: true });

            const islemTipi = interaction.customId.split('_')[2]; // alim veya satis
            const sembol = interaction.fields.getTextInputValue('sembol').toUpperCase();
            const adetInput = interaction.fields.getTextInputValue('adet');
            const adet = parseInt(adetInput);

            // Hata Kontrolleri
            if (!['BTC', 'USD', 'GLD', 'GNI'].includes(sembol)) return interaction.editReply("❌ **Hata:** Geçersiz sembol! (Sadece: BTC, USD, GLD, GNI)");
            if (isNaN(adet) || adet <= 0) return interaction.editReply("❌ **Hata:** Geçersiz miktar! Pozitif sayı gir.");

            // Verileri Çek
            const fiyat = db.fetch(`market_${sembol}`) || 100;
            const tutar = fiyat * adet;
            const bakiye = db.fetch(`para_${interaction.user.id}`) || 0;
            const varlik = db.fetch(`asset_${sembol}_${interaction.user.id}`) || 0;

            try {
                if (islemTipi === "alim") {
                    if (bakiye < tutar) return interaction.editReply(`💸 **Yetersiz Bakiye!**\nCüzdan: ${bakiye.toLocaleString()} TL\nGereken: ${tutar.toLocaleString()} TL`);
                    
                    db.add(`para_${interaction.user.id}`, -tutar);
                    db.add(`asset_${sembol}_${interaction.user.id}`, adet);
                    
                    // Fiyatı Yükselt (Arz-Talep)
                    db.set(`market_${sembol}`, Math.ceil(fiyat * 1.02)); 
                    db.set(`trend_${sembol}`, 'up');

                    await interaction.editReply(`✅ **ALIM BAŞARILI!**\n📦 +${adet} ${sembol}\n💰 -${tutar.toLocaleString()} TL`);
                } else {
                    if (varlik < adet) return interaction.editReply(`❌ **Yetersiz Varlık!**\nElinde sadece ${varlik} adet ${sembol} var.`);

                    db.add(`asset_${sembol}_${interaction.user.id}`, -adet);
                    db.add(`para_${interaction.user.id}`, tutar);

                    // Fiyatı Düşür (Arz-Talep)
                    let yeniFiyat = Math.floor(fiyat * 0.98); 
                    if (yeniFiyat < 1) yeniFiyat = 1;
                    db.set(`market_${sembol}`, yeniFiyat);
                    db.set(`trend_${sembol}`, 'down');

                    await interaction.editReply(`✅ **SATIŞ BAŞARILI!**\n📦 -${adet} ${sembol}\n💰 +${tutar.toLocaleString()} TL`);
                }
            } catch (err) {
                console.log(err);
                await interaction.editReply("❌ İşlem sırasında veritabanı hatası oldu.");
            }
        }

        // ====================================================
        //              3. PANEL SİSTEMİ (FULL KONTROL)
        // ====================================================
        
        // Panel Ana Menü Seçimi
        if (interaction.isStringSelectMenu() && interaction.customId === "panel_ana_menu") {
            const val = interaction.values[0];

            if (val === "menu_koruma") {
                const k1 = db.fetch(`kufurEngel_${interaction.guild.id}`);
                const k2 = db.fetch(`reklamEngel_${interaction.guild.id}`);
                const k3 = db.fetch(`linkEngel_${interaction.guild.id}`);
                
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId("btn_kufur").setLabel("Küfür Engel").setStyle(k1 ? ButtonStyle.Success : ButtonStyle.Secondary).setEmoji("🤬"),
                    new ButtonBuilder().setCustomId("btn_reklam").setLabel("Reklam Engel").setStyle(k2 ? ButtonStyle.Success : ButtonStyle.Secondary).setEmoji("📢"),
                    new ButtonBuilder().setCustomId("btn_link").setLabel("Link Engel").setStyle(k3 ? ButtonStyle.Success : ButtonStyle.Secondary).setEmoji("🔗"),
                    new ButtonBuilder().setCustomId("btn_geri").setLabel("Ana Menü").setStyle(ButtonStyle.Danger).setEmoji("🔙")
                );
                await interaction.update({ embeds: [new EmbedBuilder().setTitle("🛡️ Koruma Ayarları").setColor("Red").setDescription("Aktif etmek istediklerinizi seçin.")], components: [row] });
            }

            if (val === "menu_sistem") {
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId("sys_log").setLabel("Log Kanalı").setStyle(ButtonStyle.Primary).setEmoji("📜"),
                    new ButtonBuilder().setCustomId("sys_global").setLabel("Global Chat").setStyle(ButtonStyle.Primary).setEmoji("🌐"),
                    new ButtonBuilder().setCustomId("sys_welcome").setLabel("Hoş Geldin").setStyle(ButtonStyle.Primary).setEmoji("👋"),
                    new ButtonBuilder().setCustomId("sys_modrol").setLabel("Mod Rolü").setStyle(ButtonStyle.Success).setEmoji("👮‍♂️"),
                    new ButtonBuilder().setCustomId("btn_geri").setLabel("Ana Menü").setStyle(ButtonStyle.Danger)
                );
                await interaction.update({ embeds: [new EmbedBuilder().setTitle("⚙️ Sistem Ayarları").setColor("Blue").setDescription("Kurmak istediğiniz sistemi seçin.")], components: [row] });
            }

            if (val === "menu_mod") {
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId("mod_sil").setLabel("Temizle (20)").setStyle(ButtonStyle.Secondary).setEmoji("🧹"),
                    new ButtonBuilder().setCustomId("mod_kilit").setLabel("Kilitle").setStyle(ButtonStyle.Secondary).setEmoji("🔒"),
                    new ButtonBuilder().setCustomId("mod_ac").setLabel("Kilit Aç").setStyle(ButtonStyle.Secondary).setEmoji("🔓"),
                    new ButtonBuilder().setCustomId("btn_geri").setLabel("Ana Menü").setStyle(ButtonStyle.Danger)
                );
                await interaction.update({ embeds: [new EmbedBuilder().setTitle("🔨 Moderasyon Araçları").setColor("Orange")], components: [row] });
            }
        }

        // Panel Buton İşlemleri
        if (interaction.isButton()) {
            // Geri Dön
            if (interaction.customId === "btn_geri") {
                const menu = new StringSelectMenuBuilder().setCustomId("panel_ana_menu").setPlaceholder("Bir kategori seçin...").addOptions(
                    { label: 'Koruma', value: 'menu_koruma', emoji: '🛡️' },
                    { label: 'Sistemler', value: 'menu_sistem', emoji: '⚙️' },
                    { label: 'Moderasyon', value: 'menu_mod', emoji: '🔨' }
                );
                await interaction.update({ embeds: [new EmbedBuilder().setTitle("🎛️ Kontrol Merkezi").setColor("DarkButNotBlack").setDescription("Kategori seçiniz:")], components: [new ActionRowBuilder().addComponents(menu)] });
            }

            // Koruma Aç/Kapa
            if (["btn_kufur", "btn_reklam", "btn_link"].includes(interaction.customId)) {
                const key = interaction.customId.replace("btn_", "") + "Engel";
                const status = db.fetch(`${key}_${interaction.guild.id}`);
                
                if (status) db.delete(`${key}_${interaction.guild.id}`); 
                else db.set(`${key}_${interaction.guild.id}`, true);

                // Buton rengini güncelle
                const newRow = ActionRowBuilder.from(interaction.message.components[0]);
                const btnIndex = newRow.components.findIndex(b => b.data.custom_id === interaction.customId);
                newRow.components[btnIndex].setStyle(!status ? ButtonStyle.Success : ButtonStyle.Secondary);
                
                await interaction.update({ components: [newRow] });
                logGonder(interaction.guild, "🛡️ Koruma Değişti", "Orange", `${key} -> ${!status ? "AÇIK" : "KAPALI"} (${interaction.user.tag})`);
            }

            // Kanal/Rol Seçicileri Aç
            if (interaction.customId === "sys_log") interaction.reply({ content: "📜 Log kanalı seç:", components: [new ActionRowBuilder().addComponents(new ChannelSelectMenuBuilder().setCustomId("set_log_channel").setChannelTypes(ChannelType.GuildText))], ephemeral: true });
            if (interaction.customId === "sys_global") interaction.reply({ content: "🌐 Global Chat kanalı seç:", components: [new ActionRowBuilder().addComponents(new ChannelSelectMenuBuilder().setCustomId("set_global_channel").setChannelTypes(ChannelType.GuildText))], ephemeral: true });
            if (interaction.customId === "sys_welcome") interaction.reply({ content: "👋 Hoş Geldin kanalı seç:", components: [new ActionRowBuilder().addComponents(new ChannelSelectMenuBuilder().setCustomId("set_welcome_channel").setChannelTypes(ChannelType.GuildText))], ephemeral: true });
            if (interaction.customId === "sys_modrol") interaction.reply({ content: "👮‍♂️ Moderatör rolü seç:", components: [new ActionRowBuilder().addComponents(new RoleSelectMenuBuilder().setCustomId("set_mod_role"))], ephemeral: true });

            // Moderasyon İşlemleri
            if (interaction.customId === "mod_sil") { await interaction.channel.bulkDelete(20, true); interaction.reply({ content: "🧹 20 Mesaj silindi.", ephemeral: true }); }
            if (interaction.customId === "mod_kilit") { await interaction.channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: false }); interaction.reply({ content: "🔒 Kanal kilitlendi.", ephemeral: true }); }
            if (interaction.customId === "mod_ac") { await interaction.channel.permissionOverwrites.edit(interaction.guild.id, { SendMessages: true }); interaction.reply({ content: "🔓 Kanal açıldı.", ephemeral: true }); }
        }

        // Kanal/Rol Seçim Kaydı
        if (interaction.isChannelSelectMenu()) {
            if (interaction.customId === "set_log_channel") { db.set(`logKanal_${interaction.guild.id}`, interaction.values[0]); interaction.update({ content: "✅ Log kanalı ayarlandı.", components: [] }); }
            if (interaction.customId === "set_global_channel") { db.set(`globalKanal_${interaction.guild.id}`, interaction.values[0]); interaction.update({ content: "✅ Global Chat ayarlandı.", components: [] }); }
            if (interaction.customId === "set_welcome_channel") { db.set(`hosgeldinKanal_${interaction.guild.id}`, interaction.values[0]); interaction.update({ content: "✅ Hoş Geldin kanalı ayarlandı.", components: [] }); }
        }
        if (interaction.isRoleSelectMenu()) {
            if (interaction.customId === "set_mod_role") { db.set(`modRol_${interaction.guild.id}`, interaction.values[0]); interaction.update({ content: "✅ Moderatör rolü ayarlandı.", components: [] }); }
        }

        // ====================================================
        //              4. TICKET SİSTEMİ (BUTONLU)
        // ====================================================
        if (interaction.isButton() && ["ticket_destek", "ticket_sikayet", "ticket_basvuru"].includes(interaction.customId)) {
            let kanalAdi = "destek", konu = "Genel Destek", renk = "Green";
            if (interaction.customId === "ticket_sikayet") { kanalAdi = "sikayet"; konu = "Şikayet"; renk = "Red"; }
            if (interaction.customId === "ticket_basvuru") { kanalAdi = "basvuru"; konu = "Başvuru"; renk = "Gold"; }

            if (interaction.guild.channels.cache.find(c => c.name === `${kanalAdi}-${interaction.user.username.toLowerCase()}`)) 
                return interaction.reply({ content: "❌ Zaten açık bir talebin var!", ephemeral: true });

            const channel = await interaction.guild.channels.create({
                name: `${kanalAdi}-${interaction.user.username}`,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },
                    { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
                    { id: client.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
                ]
            });

            const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("ticket_kapat").setLabel("Talebi Kapat").setStyle(ButtonStyle.Secondary).setEmoji("🔒"));
            
            await channel.send({ 
                content: `<@${interaction.user.id}> | @here`, 
                embeds: [new EmbedBuilder().setTitle(konu).setDescription("Yetkililer en kısa sürede sizinle ilgilenecektir.").setColor(renk)], 
                components: [row] 
            });
            
            interaction.reply({ content: `✅ Talep açıldı: ${channel}`, ephemeral: true });
            logGonder(interaction.guild, "🎫 Ticket Açıldı", "Green", `Açan: ${interaction.user.tag}\nTür: ${konu}`);
        }

        // Ticket Kapatma (Transcriptli)
        if (interaction.isButton() && interaction.customId === "ticket_kapat") {
            interaction.reply("💾 Sohbet kaydediliyor...");
            try {
                const messages = await interaction.channel.messages.fetch({ limit: 100 });
                const content = messages.reverse().map(m => `[${new Date(m.createdTimestamp).toLocaleTimeString()}] ${m.author.tag}: ${m.content}`).join('\n');
                const file = new AttachmentBuilder(Buffer.from(content, "utf-8"), { name: `ticket-${interaction.channel.name}.txt` });
                
                const logID = db.fetch(`logKanal_${interaction.guild.id}`);
                if (logID) {
                    const logCh = interaction.guild.channels.cache.get(logID);
                    if (logCh) logCh.send({ content: `🔒 **Ticket Kapatıldı:** ${interaction.channel.name} (Kapatan: ${interaction.user.tag})`, files: [file] });
                }
            } catch (e) { console.log(e); }
            setTimeout(() => interaction.channel.delete().catch(()=>{}), 5000);
        }

        // ====================================================
        //              5. YARDIM MENÜSÜ (BUTONLU)
        // ====================================================
        if (interaction.isButton() && interaction.customId.startsWith("help_")) {
            const v = interaction.customId;
            let t = "", d = "";
            
            if (v === "help_eco") { t = "💎 Ekonomi & Ticaret"; d = "`/gunluk` `/gonder` `/borsa` `/karaborsa` `/al` `/sat`"; }
            else if (v === "help_rpg") { t = "⚔️ RPG & Savaş"; d = "`/avla` `/duello` `/envanter` `/klan` `/isgal` `/reenkarne`"; }
            else if (v === "help_mod") { t = "🛡️ Moderasyon"; d = "`/panel` `/ban` `/kick` `/sil` `/timeout` `/hosgeldin-ayarla`"; }
            else { t = "🎲 Eğlence"; d = "`/hayal-et` `/biyografi` `/istatistik` `/evlen` `/ship` `/kasa-ac` `/slots` `/tkm`"; }

            const embed = new EmbedBuilder().setTitle(t).setDescription(d).setColor("Random").setThumbnail(client.user.displayAvatarURL());
            interaction.update({ embeds: [embed] });
        }

        // ====================================================
        //              6. DİĞER (ÖNERİ, BOSS, OY)
        // ====================================================
        
        // Öneri
        if (interaction.isButton() && interaction.customId === "btn_oneri_yap") {
            const modal = new ModalBuilder().setCustomId('modal_oneri_gonder').setTitle('Öneri Formu');
            const input = new TextInputBuilder().setCustomId('oneri_metni').setLabel("Fikriniz?").setStyle(TextInputStyle.Paragraph).setRequired(true);
            modal.addComponents(new ActionRowBuilder().addComponents(input));
            await interaction.showModal(modal);
        }
        if (interaction.isModalSubmit() && interaction.customId === 'modal_oneri_gonder') {
            const metin = interaction.fields.getTextInputValue('oneri_metni');
            interaction.reply({ content: '✅ İletildi!', ephemeral: true });
            try { const owner = await interaction.guild.fetchOwner(); owner.send(`📩 **Öneri:** ${metin}\n👤 **Gönderen:** ${interaction.user.tag}`); } catch (e) {}
        }

        // Çekiliş Katıl
        if (interaction.isButton() && interaction.customId.startsWith('cekilis_katil_')) {
            const id = interaction.customId.split('_')[2];
            const d = db.fetch(`cekilis_${id}`);
            if (!d) return interaction.reply({content:'Bitmiş.', ephemeral:true});
            if (d.katilanlar.includes(interaction.user.id)) return interaction.reply({content:'Zaten katıldın.', ephemeral:true});
            db.push(`cekilis_${id}.katilanlar`, interaction.user.id);
            
            const r = ActionRowBuilder.from(interaction.message.components[0]);
            r.components[0].setLabel(`Katıl (${d.katilanlar.length + 1})`);
            interaction.update({ components: [r] });
        }

        // Oylama
        if (interaction.isButton() && (interaction.customId === 'oy_evet' || interaction.customId === 'oy_hayir')) {
            const e = EmbedBuilder.from(interaction.message.embeds[0]);
            const idx = interaction.customId === 'oy_evet' ? 0 : 1;
            e.fields[idx].value = (parseInt(e.fields[idx].value) + 1).toString();
            interaction.update({ embeds: [e] });
        }

        // Boss Saldırı
        if (interaction.isButton() && interaction.customId === "boss_vur") {
            let h = db.fetch(`boss_${interaction.message.id}`);
            if (h <= 0) return interaction.reply({ content: "Zaten öldü.", ephemeral: true });
            h -= 100; db.set(`boss_${interaction.message.id}`, h);
            if (h <= 0) {
                interaction.update({ content: "🏆 **BOSS ÖLDÜ!**", components: [] });
                db.add(`para_${interaction.user.id}`, 5000);
            } else {
                interaction.reply({ content: `⚔️ Vurdun! Kalan Can: ${h}`, ephemeral: true });
            }
        }
    }
};