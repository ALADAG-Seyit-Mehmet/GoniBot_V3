const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ChannelSelectMenuBuilder, RoleSelectMenuBuilder, ChannelType, PermissionsBitField, AttachmentBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const db = require('croxydb');

async function logGonder(guild, baslik, renk, aciklama) {
    const logID = db.fetch(`logKanal_${guild.id}`);
    if(!logID) return;
    const ch = guild.channels.cache.get(logID);
    if(ch) ch.send({ embeds: [new EmbedBuilder().setTitle(baslik).setColor(renk).setDescription(aciklama).setTimestamp()] });
}

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {

        // --- HAPİS VE KOMUT YÖNETİCİSİ ---
        if (interaction.isChatInputCommand()) {
            const hapis = db.fetch(`hapis_${interaction.user.id}`);
            if (hapis && Date.now() < hapis) return interaction.reply({ content: "🔒 Hapistesin!", ephemeral: true });
            if (hapis && Date.now() > hapis) db.delete(`hapis_${interaction.user.id}`);
            const cmd = client.commands.get(interaction.commandName);
            if (cmd) try { await cmd.execute(interaction); } catch (e) { console.error(e); }
        }

        // ====================================================
        //              ÖNERİ KUTUSU (MODAL & DM) 💡
        // ====================================================
        
        // 1. BUTONA BASINCA FORM AÇ
        if (interaction.isButton() && interaction.customId === "btn_oneri_yap") {
            const modal = new ModalBuilder()
                .setCustomId('modal_oneri_gonder')
                .setTitle('Öneri Formu');

            const input = new TextInputBuilder()
                .setCustomId('oneri_metni')
                .setLabel("Fikriniz Nedir?")
                .setStyle(TextInputStyle.Paragraph) // Büyük kutu
                .setPlaceholder("Sunucuya yeni emojiler eklensin çünkü...")
                .setRequired(true);

            const row = new ActionRowBuilder().addComponents(input);
            modal.addComponents(row);

            await interaction.showModal(modal);
        }

        // 2. FORM GÖNDERİLİNCE (DM AT)
        if (interaction.isModalSubmit() && interaction.customId === 'modal_oneri_gonder') {
            const metin = interaction.fields.getTextInputValue('oneri_metni');
            
            // Kullanıcıya cevap ver
            await interaction.reply({ content: '✅ Öneriniz başarıyla sunucu sahibine iletildi! Teşekkürler.', ephemeral: true });

            // Sunucu sahibini bul ve DM at
            try {
                const owner = await interaction.guild.fetchOwner();
                
                const dmEmbed = new EmbedBuilder()
                    .setTitle('📩 Yeni Bir Öneri Var!')
                    .setDescription(`**Sunucu:** ${interaction.guild.name}`)
                    .addFields(
                        { name: '👤 Gönderen', value: `${interaction.user.tag} \n(ID: ${interaction.user.id})`, inline: true },
                        { name: '📝 Mesaj', value: metin, inline: false }
                    )
                    .setColor('Yellow')
                    .setThumbnail(interaction.user.displayAvatarURL())
                    .setTimestamp();

                await owner.send({ embeds: [dmEmbed] });
            } catch (err) {
                console.log("DM Gönderilemedi (Sahibi DM kapatmış olabilir).");
            }
        }

        // ====================================================
        //              DİĞER SİSTEMLER (KORUNDU)
        // ====================================================

        // TICKET SİSTEMİ
        if (interaction.isStringSelectMenu() && interaction.customId === "ticket_secim") {
            const s = interaction.values[0];
            let n="destek", t="Destek", c="Green";
            if(s==="ticket_sikayet"){n="sikayet";t="Şikayet";c="Red";} if(s==="ticket_basvuru"){n="basvuru";t="Başvuru";c="Gold";}
            if(interaction.guild.channels.cache.find(x=>x.name===`${n}-${interaction.user.username.toLowerCase()}`)) return interaction.reply({content:"❌ Zaten var!", ephemeral:true});
            const ch = await interaction.guild.channels.create({ name: `${n}-${interaction.user.username}`, type: ChannelType.GuildText, permissionOverwrites:[{id:interaction.guild.id,deny:[PermissionsBitField.Flags.ViewChannel]},{id:interaction.user.id,allow:[PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]},{id:client.user.id,allow:[PermissionsBitField.Flags.ViewChannel]}] });
            ch.send({content:`<@${interaction.user.id}>`, embeds:[new EmbedBuilder().setTitle(t).setDescription("Hoş geldin.").setColor(c)], components:[new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("ticket_kapat").setLabel("Kapat").setStyle(ButtonStyle.Secondary).setEmoji("🔒"))]});
            interaction.reply({content:`Açıldı: ${ch}`, ephemeral:true});
            logGonder(interaction.guild, "Ticket Açıldı", "Green", `Açan: ${interaction.user}`);
        }
        // Ticket Kapat (Buton)
        if (interaction.isButton() && interaction.customId === "ticket_kapat") {
            interaction.reply("Kaydediliyor...");
            try {
                const msgs = await interaction.channel.messages.fetch({ limit: 100 });
                const txt = msgs.reverse().map(m => `${m.author.tag}: ${m.content}`).join('\n');
                const file = new AttachmentBuilder(Buffer.from(txt, "utf-8"), { name: `ticket.txt` });
                const l = db.fetch(`logKanal_${interaction.guild.id}`);
                if(l) interaction.guild.channels.cache.get(l)?.send({content:`Ticket Kapatıldı: ${interaction.channel.name}`, files:[file]});
            } catch(e){}
            setTimeout(()=>interaction.channel.delete().catch(()=>{}), 3000);
        }
        // Ticket Aç (Buton - Eski yöntem destek butonu için)
        if (interaction.isButton() && ["ticket_destek", "ticket_sikayet", "ticket_basvuru"].includes(interaction.customId)) {
            let n="destek", t="Destek", c="Green";
            if(interaction.customId==="ticket_sikayet"){n="sikayet";t="Şikayet";c="Red";} if(interaction.customId==="ticket_basvuru"){n="basvuru";t="Başvuru";c="Gold";}
            if(interaction.guild.channels.cache.find(x=>x.name===`${n}-${interaction.user.username.toLowerCase()}`)) return interaction.reply({content:"❌ Zaten var!", ephemeral:true});
            const ch = await interaction.guild.channels.create({ name: `${n}-${interaction.user.username}`, type: ChannelType.GuildText, permissionOverwrites:[{id:interaction.guild.id,deny:[PermissionsBitField.Flags.ViewChannel]},{id:interaction.user.id,allow:[PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]},{id:client.user.id,allow:[PermissionsBitField.Flags.ViewChannel]}] });
            ch.send({content:`<@${interaction.user.id}>`, embeds:[new EmbedBuilder().setTitle(t).setDescription("Hoş geldin.").setColor(c)], components:[new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("ticket_kapat").setLabel("Kapat").setStyle(ButtonStyle.Secondary).setEmoji("🔒"))]});
            interaction.reply({content:`Açıldı: ${ch}`, ephemeral:true});
            logGonder(interaction.guild, "Ticket Açıldı", "Green", `Açan: ${interaction.user}`);
        }

        // YARDIM MENÜSÜ
        if (interaction.isButton() && ["help_eco", "help_rpg", "help_mod", "help_fun"].includes(interaction.customId)) {
            const val = interaction.customId;
            let t = "", d = "";
            if (val === "help_eco") { t = "💎 Ekonomi"; d = "` /gunluk ` ` /gonder ` ` /borsa ` ` /karaborsa ` ` /market `"; }
            if (val === "help_rpg") { t = "⚔️ RPG"; d = "` /avla ` ` /duello ` ` /envanter ` ` /klan ` ` /isgal ` ` /reenkarne `"; }
            if (val === "help_mod") { t = "🛡️ Moderasyon"; d = "` /panel ` ` /ban ` ` /kick ` ` /sil ` ` /timeout ` ` /hosgeldin-ayarla ` ` /oneri-kutusu-kur `"; }
            if (val === "help_fun") { t = "🎲 Eğlence"; d = "` /hayal-et ` ` /biyografi ` ` /istatistik ` ` /evlen ` ` /ship ` ` /kasa-ac ` ` /slots `"; }
            const embed = new EmbedBuilder().setTitle(t).setDescription(d).setColor("Random").setThumbnail(client.user.displayAvatarURL());
            await interaction.update({ embeds: [embed] });
        }

        // PANEL SİSTEMİ
        if (interaction.isStringSelectMenu() && interaction.customId === "panel_ana_menu") {
            const v = interaction.values[0];
            if(v==="menu_koruma"){
                const k1=db.fetch(`kufurEngel_${interaction.guild.id}`), k2=db.fetch(`reklamEngel_${interaction.guild.id}`), k3=db.fetch(`linkEngel_${interaction.guild.id}`);
                const r = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("btn_kufur").setLabel("Küfür").setStyle(k1?ButtonStyle.Success:ButtonStyle.Secondary),new ButtonBuilder().setCustomId("btn_reklam").setLabel("Reklam").setStyle(k2?ButtonStyle.Success:ButtonStyle.Secondary),new ButtonBuilder().setCustomId("btn_link").setLabel("Link").setStyle(k3?ButtonStyle.Success:ButtonStyle.Secondary),new ButtonBuilder().setCustomId("btn_geri").setLabel("Geri").setStyle(ButtonStyle.Danger));
                interaction.update({embeds:[new EmbedBuilder().setTitle("🛡️ Koruma").setColor("Red")], components:[r]});
            }
            if(v==="menu_sistem"){
                const r = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("sys_log").setLabel("Log").setStyle(ButtonStyle.Primary),new ButtonBuilder().setCustomId("sys_global").setLabel("Global").setStyle(ButtonStyle.Primary),new ButtonBuilder().setCustomId("sys_welcome").setLabel("Hoş Geldin").setStyle(ButtonStyle.Primary),new ButtonBuilder().setCustomId("sys_modrol").setLabel("Mod Rolü").setStyle(ButtonStyle.Success),new ButtonBuilder().setCustomId("btn_geri").setLabel("Geri").setStyle(ButtonStyle.Danger));
                interaction.update({embeds:[new EmbedBuilder().setTitle("⚙️ Sistemler").setColor("Blue")], components:[r]});
            }
            if(v==="menu_mod"){
                const r = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("mod_sil").setLabel("Sil").setStyle(ButtonStyle.Secondary),new ButtonBuilder().setCustomId("mod_kilit").setLabel("Kilit").setStyle(ButtonStyle.Secondary),new ButtonBuilder().setCustomId("btn_geri").setLabel("Geri").setStyle(ButtonStyle.Danger));
                interaction.update({embeds:[new EmbedBuilder().setTitle("🔨 Moderasyon").setColor("Orange")], components:[r]});
            }
        }

        // PANEL BUTONLARI
        if (interaction.isButton()) {
            if(interaction.customId==="btn_geri") {
                const m = new StringSelectMenuBuilder().setCustomId("panel_ana_menu").addOptions({label:'Koruma',value:'menu_koruma'},{label:'Sistemler',value:'menu_sistem'},{label:'Moderasyon',value:'menu_mod'});
                interaction.update({embeds:[new EmbedBuilder().setTitle("🎛️ Panel").setColor("Black")], components:[new ActionRowBuilder().addComponents(m)]});
            }
            if(["btn_kufur","btn_reklam","btn_link"].includes(interaction.customId)){
                const k = interaction.customId.replace("btn_","")+"Engel";
                const v = db.fetch(`${k}_${interaction.guild.id}`);
                if(v) db.delete(`${k}_${interaction.guild.id}`); else db.set(`${k}_${interaction.guild.id}`, true);
                const r = ActionRowBuilder.from(interaction.message.components[0]);
                const i = r.components.findIndex(x=>x.data.custom_id===interaction.customId);
                r.components[i].setStyle(!v?ButtonStyle.Success:ButtonStyle.Secondary);
                interaction.update({components:[r]});
            }
            // Kanal Seçiciler
            if(interaction.customId==="sys_log") interaction.reply({components:[new ActionRowBuilder().addComponents(new ChannelSelectMenuBuilder().setCustomId("set_log_channel").setChannelTypes(ChannelType.GuildText))], ephemeral:true});
            if(interaction.customId==="sys_global") interaction.reply({components:[new ActionRowBuilder().addComponents(new ChannelSelectMenuBuilder().setCustomId("set_global_channel").setChannelTypes(ChannelType.GuildText))], ephemeral:true});
            if(interaction.customId==="sys_welcome") interaction.reply({components:[new ActionRowBuilder().addComponents(new ChannelSelectMenuBuilder().setCustomId("set_welcome_channel").setChannelTypes(ChannelType.GuildText))], ephemeral:true});
            if(interaction.customId==="sys_modrol") interaction.reply({components:[new ActionRowBuilder().addComponents(new RoleSelectMenuBuilder().setCustomId("set_mod_role"))], ephemeral:true});
            
            // Mod
            if(interaction.customId==="mod_sil") { await interaction.channel.bulkDelete(20,true); interaction.reply({content:"Silindi.", ephemeral:true}); }
            if(interaction.customId==="mod_kilit") { interaction.channel.permissionOverwrites.edit(interaction.guild.id, {SendMessages:false}); interaction.reply({content:"Kilitlendi.", ephemeral:true}); }
            
            // Çekiliş/Oylama/Boss
            if(interaction.customId.startsWith('cekilis_katil_')) {
                const id=interaction.customId.split('_')[2];
                const d=db.fetch(`cekilis_${id}`);
                if(!d) return interaction.reply({content:'Bitmiş.', ephemeral:true});
                if(d.katilanlar.includes(interaction.user.id)) return interaction.reply({content:'Zaten katıldın.', ephemeral:true});
                db.push(`cekilis_${id}.katilanlar`, interaction.user.id);
                const r = ActionRowBuilder.from(interaction.message.components[0]);
                r.components[0].setLabel(`Katıl (${d.katilanlar.length+1})`);
                interaction.update({components:[r]});
            }
            if(interaction.customId==="boss_vur") {
                let h=db.fetch(`boss_${interaction.message.id}`);
                if(h<=0) return interaction.reply({content:"Öldü.", ephemeral:true});
                h-=100; db.set(`boss_${interaction.message.id}`, h);
                if(h<=0) { interaction.update({content:"🏆 Öldü!", components:[]}); db.add(`para_${interaction.user.id}`, 5000); }
                else interaction.reply({content:`Vurdun! ${h}`, ephemeral:true});
            }
            if(interaction.customId==='oy_evet'||interaction.customId==='oy_hayir'){
                const e=EmbedBuilder.from(interaction.message.embeds[0]);
                const i=interaction.customId==='oy_evet'?0:1;
                e.fields[i].value=(parseInt(e.fields[i].value)+1).toString();
                interaction.update({embeds:[e]});
            }
        }

        // KANAL/ROL KAYIT
        if (interaction.isChannelSelectMenu()) {
            const m = interaction.values[0];
            if(interaction.customId==="set_log_channel") db.set(`logKanal_${interaction.guild.id}`, m);
            if(interaction.customId==="set_global_channel") db.set(`globalKanal_${interaction.guild.id}`, m);
            if(interaction.customId==="set_welcome_channel") db.set(`hosgeldinKanal_${interaction.guild.id}`, m);
            interaction.update({content:"✅ Ayarlandı.", components:[]});
        }
        if (interaction.isRoleSelectMenu()) {
            db.set(`modRol_${interaction.guild.id}`, interaction.values[0]);
            interaction.update({content:"✅ Ayarlandı.", components:[]});
        }
    }
};