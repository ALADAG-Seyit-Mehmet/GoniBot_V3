const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, ChannelSelectMenuBuilder, RoleSelectMenuBuilder, ChannelType, PermissionsBitField, AttachmentBuilder } = require('discord.js');
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

        if (interaction.isChatInputCommand()) {
            const hapis = db.fetch(`hapis_${interaction.user.id}`);
            if (hapis && Date.now() < hapis) return interaction.reply({ content: "🔒 Hapistesin!", ephemeral: true });
            if (hapis && Date.now() > hapis) db.delete(`hapis_${interaction.user.id}`);
            const cmd = client.commands.get(interaction.commandName);
            if (cmd) try { await cmd.execute(interaction); } catch (e) { console.error(e); }
        }

        // ====================================================
        //              YENİ ÖZELLİKLER (ÇEKİLİŞ & ÖNERİ)
        // ====================================================

        // ÇEKİLİŞ KATILIM
        if (interaction.isButton() && interaction.customId.startsWith('cekilis_katil_')) {
            const id = interaction.customId.split('_')[2];
            const data = db.fetch(`cekilis_${id}`);
            
            if (!data) return interaction.reply({ content: 'Bu çekiliş bitmiş.', ephemeral: true });
            if (data.katilanlar.includes(interaction.user.id)) return interaction.reply({ content: 'Zaten katıldın!', ephemeral: true });

            // Ekle
            db.push(`cekilis_${id}.katilanlar`, interaction.user.id);
            
            // Buton Sayısını Güncelle
            const yeniData = db.fetch(`cekilis_${id}`);
            const row = ActionRowBuilder.from(interaction.message.components[0]);
            row.components[0].setLabel(`Çekilişe Katıl (${yeniData.katilanlar.length})`);
            
            await interaction.update({ components: [row] });
            // interaction.followUp({ content: '🎉 Çekilişe katıldın!', ephemeral: true }); // Opsiyonel bildirim
        }

        // ÖNERİ OYLAMA
        if (interaction.isButton() && (interaction.customId === 'oy_evet' || interaction.customId === 'oy_hayir')) {
            // Basit oylama mantığı: Embeddeki sayıları artırır
            // Profesyonel sistemde kimin oy verdiği DB'ye kaydedilir ki tekrar basamasın.
            // Şimdilik görsel artış yapalım:
            
            const embed = EmbedBuilder.from(interaction.message.embeds[0]);
            let fieldIndex = interaction.customId === 'oy_evet' ? 0 : 1;
            let currentVal = parseInt(embed.fields[fieldIndex].value);
            
            embed.fields[fieldIndex].value = (currentVal + 1).toString();
            
            await interaction.update({ embeds: [embed] });
        }

        // ROL MENÜSÜ İŞLEMİ (Demo)
        if (interaction.isStringSelectMenu() && interaction.customId === 'rol_al_menu') {
            const secim = interaction.values[0];
            // Burada gerçek Rol ID'leri kullanılmalı.
            // interaction.member.roles.add("ROL_ID");
            interaction.reply({ content: `✅ **${secim}** rolü için işlem yapıldı. (Demo: Gerçek ID girilirse çalışır)`, ephemeral: true });
        }

        // ====================================================
        //              TICKET SİSTEMİ (Transcriptli)
        // ====================================================
        if (interaction.isStringSelectMenu() && interaction.customId === "ticket_secim") {
            const s = interaction.values[0];
            let n="destek", t="Destek", c="Green";
            if(s==="ticket_sikayet"){n="sikayet";t="Şikayet";c="Red";} if(s==="ticket_basvuru"){n="basvuru";t="Başvuru";c="Gold";}
            if(interaction.guild.channels.cache.find(x=>x.name===`${n}-${interaction.user.username.toLowerCase()}`)) return interaction.reply({content:"Zaten var!", ephemeral:true});
            const ch = await interaction.guild.channels.create({ name: `${n}-${interaction.user.username}`, type: ChannelType.GuildText, permissionOverwrites:[{id:interaction.guild.id,deny:[PermissionsBitField.Flags.ViewChannel]},{id:interaction.user.id,allow:[PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages]},{id:client.user.id,allow:[PermissionsBitField.Flags.ViewChannel]}] });
            ch.send({content:`<@${interaction.user.id}>`, embeds:[new EmbedBuilder().setTitle(t).setDescription("Hoş geldin.").setColor(c)], components:[new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("ticket_kapat").setLabel("Kapat").setStyle(ButtonStyle.Secondary).setEmoji("🔒"))]});
            interaction.reply({content:`Açıldı: ${ch}`, ephemeral:true});
            logGonder(interaction.guild, "Ticket Açıldı", "Green", `Açan: ${interaction.user}`);
        }
        if (interaction.isButton() && interaction.customId === "ticket_kapat") {
            interaction.reply("Kaydediliyor...");
            try {
                const msgs = await interaction.channel.messages.fetch({ limit: 100 });
                const txt = msgs.reverse().map(m => `${m.author.tag}: ${m.content}`).join('\n');
                const file = new AttachmentBuilder(Buffer.from(txt, "utf-8"), { name: `ticket.txt` });
                const l = db.fetch(`logKanal_${interaction.guild.id}`);
                if(l) interaction.guild.channels.cache.get(l)?.send({content:`🔒 **Kapatıldı:** ${interaction.channel.name} (${interaction.user.tag})`, files:[file]});
            } catch(e){}
            setTimeout(()=>interaction.channel.delete().catch(()=>{}), 3000);
        }

        // ====================================================
        //              PANEL SİSTEMİ (Full + Hoşgeldin)
        // ====================================================
        if (interaction.isStringSelectMenu() && interaction.customId === "panel_ana_menu") {
            const v = interaction.values[0];
            if(v==="menu_koruma"){
                const k1=db.fetch(`kufurEngel_${interaction.guild.id}`), k2=db.fetch(`reklamEngel_${interaction.guild.id}`), k3=db.fetch(`linkEngel_${interaction.guild.id}`);
                const r = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId("btn_kufur").setLabel("Küfür").setStyle(k1?ButtonStyle.Success:ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId("btn_reklam").setLabel("Reklam").setStyle(k2?ButtonStyle.Success:ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId("btn_link").setLabel("Link").setStyle(k3?ButtonStyle.Success:ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId("btn_geri").setLabel("Geri").setStyle(ButtonStyle.Danger)
                );
                interaction.update({embeds:[new EmbedBuilder().setTitle("🛡️ Koruma").setColor("Red")], components:[r]});
            }
            if(v==="menu_sistem"){
                const r = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId("sys_log").setLabel("Log").setStyle(ButtonStyle.Primary).setEmoji("📜"),
                    new ButtonBuilder().setCustomId("sys_global").setLabel("Global").setStyle(ButtonStyle.Primary).setEmoji("🌐"),
                    new ButtonBuilder().setCustomId("sys_welcome").setLabel("Hoş Geldin").setStyle(ButtonStyle.Primary).setEmoji("👋"),
                    new ButtonBuilder().setCustomId("sys_modrol").setLabel("Mod Rolü").setStyle(ButtonStyle.Success).setEmoji("👮‍♂️"),
                    new ButtonBuilder().setCustomId("btn_geri").setLabel("Geri").setStyle(ButtonStyle.Danger)
                );
                interaction.update({embeds:[new EmbedBuilder().setTitle("⚙️ Sistemler").setColor("Blue")], components:[r]});
            }
            if(v==="menu_mod"){
                const r = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("mod_sil").setLabel("Sil").setStyle(ButtonStyle.Secondary), new ButtonBuilder().setCustomId("mod_kilit").setLabel("Kilitle").setStyle(ButtonStyle.Secondary), new ButtonBuilder().setCustomId("btn_geri").setLabel("Geri").setStyle(ButtonStyle.Danger));
                interaction.update({embeds:[new EmbedBuilder().setTitle("🔨 Moderasyon").setColor("Orange")], components:[r]});
            }
        }

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
            if(interaction.customId==="sys_log") interaction.reply({components:[new ActionRowBuilder().addComponents(new ChannelSelectMenuBuilder().setCustomId("set_log_channel").setChannelTypes(ChannelType.GuildText))], ephemeral:true});
            if(interaction.customId==="sys_global") interaction.reply({components:[new ActionRowBuilder().addComponents(new ChannelSelectMenuBuilder().setCustomId("set_global_channel").setChannelTypes(ChannelType.GuildText))], ephemeral:true});
            if(interaction.customId==="sys_welcome") interaction.reply({components:[new ActionRowBuilder().addComponents(new ChannelSelectMenuBuilder().setCustomId("set_welcome_channel").setChannelTypes(ChannelType.GuildText))], ephemeral:true});
            if(interaction.customId==="sys_modrol") interaction.reply({components:[new ActionRowBuilder().addComponents(new RoleSelectMenuBuilder().setCustomId("set_mod_role"))], ephemeral:true});
            
            if(interaction.customId==="mod_sil") { await interaction.channel.bulkDelete(20,true); interaction.reply({content:"Silindi.", ephemeral:true}); }
            if(interaction.customId==="mod_kilit") { interaction.channel.permissionOverwrites.edit(interaction.guild.id, {SendMessages:false}); interaction.reply({content:"Kilitlendi.", ephemeral:true}); }
            
            if(interaction.customId==="boss_vur") {
                let h = db.fetch(`boss_${interaction.message.id}`);
                if(h<=0) return interaction.reply({content:"Öldü.", ephemeral:true});
                h-=100; db.set(`boss_${interaction.message.id}`, h);
                if(h<=0) { interaction.update({content:"🏆 Öldü!", components:[]}); db.add(`para_${interaction.user.id}`, 5000); }
                else interaction.reply({content:`Vurdun! Kalan: ${h}`, ephemeral:true});
            }
        }

        if(interaction.isChannelSelectMenu()) {
            const m = interaction.values[0];
            if(interaction.customId==="set_log_channel") db.set(`logKanal_${interaction.guild.id}`, m);
            if(interaction.customId==="set_global_channel") db.set(`globalKanal_${interaction.guild.id}`, m);
            if(interaction.customId==="set_welcome_channel") db.set(`hosgeldinKanal_${interaction.guild.id}`, m);
            interaction.update({content:"✅ Ayarlandı.", components:[]});
        }
        if(interaction.isRoleSelectMenu()) {
            db.set(`modRol_${interaction.guild.id}`, interaction.values[0]);
            interaction.update({content:"✅ Rol Ayarlandı.", components:[]});
        }
    }
};