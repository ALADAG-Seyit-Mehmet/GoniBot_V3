const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder } = require('discord.js');
module.exports = {
    data: new SlashCommandBuilder().setName('karaborsa').setDescription('Yasadışı dükkan.'),
    async execute(i) {
        const row = new ActionRowBuilder().addComponents(new StringSelectMenuBuilder().setCustomId('dark_menu').addOptions(
            {label:'Kiralık Katil (5000)', value:'katil', description:'Susturma atar.'},
            {label:'Sahte Kimlik (2000)', value:'kimlik', description:'İsim değiştirir.'}
        ));
        i.reply({content:"🕵️ Ne lazım?", components:[row], ephemeral:true});
    }
};