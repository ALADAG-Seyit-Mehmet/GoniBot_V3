const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, ChannelType, PermissionsBitField } = require('discord.js');
const db = require('croxydb');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        
        // Hapis Kontrol
        if (interaction.isChatInputCommand()) {
            const hapis = db.fetch(`hapis_${interaction.user.id}`);
            if (hapis && Date.now() < hapis) return interaction.reply({content: "🔒 Hapistesin!", ephemeral: true});
            if (hapis && Date.now() > hapis) db.delete(`hapis_${interaction.user.id}`);
        }

        if (interaction.isChatInputCommand()) {
            const cmd = client.commands.get(interaction.commandName);
            if(cmd) try { await cmd.execute(interaction); } catch(e) { console.error(e); }
        }

        if (interaction.isButton()) {
            // Dashboard
            if (interaction.customId === "dash_main") {
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId("dash_koruma").setLabel("Koruma").setStyle(ButtonStyle.Danger),
                    new ButtonBuilder().setCustomId("dash_sistem").setLabel("Sistemler").setStyle(ButtonStyle.Primary)
                );
                interaction.update({content: "Ana Menü", components: [row]});
            }
            if (interaction.customId === "dash_koruma") {
                const k = db.fetch(`kufurEngel_${interaction.guild.id}`);
                const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId("toggle_kufur").setLabel(`Küfür Engel: ${k?"AÇIK":"KAPALI"}`).setStyle(k?ButtonStyle.Success:ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId("dash_main").setLabel("Geri").setStyle(ButtonStyle.Danger)
                );
                interaction.update({content: "Koruma Ayarları", components: [row]});
            }
            if (interaction.customId === "toggle_kufur") {
                const s = db.fetch(`kufurEngel_${interaction.guild.id}`);
                if(s) db.delete(`kufurEngel_${interaction.guild.id}`); else db.set(`kufurEngel_${interaction.guild.id}`, true);
                interaction.reply({content: "Ayar değiştirildi.", ephemeral: true});
            }
            if (interaction.customId === "dash_sistem") {
                 const row = new ActionRowBuilder().addComponents(
                    new ButtonBuilder().setCustomId("setup_global").setLabel("Global Chat Kur").setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder().setCustomId("dash_main").setLabel("Geri").setStyle(ButtonStyle.Danger)
                );
                interaction.update({content: "Sistem Seç:", components: [row]});
            }
            // Boss
            if (interaction.customId === "boss_vur") {
                let hp = db.fetch(`boss_${interaction.message.id}`);
                if(hp <= 0) return interaction.reply({content:"Öldü!", ephemeral: true});
                hp -= 100;
                db.set(`boss_${interaction.message.id}`, hp);
                if(hp <= 0) {
                    interaction.update({content: `🏆 Boss öldü! ${interaction.user} bitirdi!`, components: []});
                    db.add(`para_${interaction.user.id}`, 5000);
                } else interaction.reply({content: `Vurdun! Kalan: ${hp}`, ephemeral: true});
            }
        }
    }
};