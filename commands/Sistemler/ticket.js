const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionsBitField, EmbedBuilder } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder().setName('ticket-kur').setDescription('Destek sistemi.'),
    async execute(i) {
        const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId('ticket_ac').setLabel('Destek Talebi').setStyle(ButtonStyle.Primary).setEmoji('📩'));
        i.channel.send({embeds:[new EmbedBuilder().setTitle("Destek").setDescription("Talep açmak için tıkla.")], components:[row]});
        i.reply({content:"Kuruldu.", ephemeral:true});
    },
    // InteractionCreate.js içinde zaten ticket_ac mantığı var mı diye kontrol etmiştik, 
    // eğer yoksa bu buton çalışmaz. Ama V3 paketinde eklemiştik.
};