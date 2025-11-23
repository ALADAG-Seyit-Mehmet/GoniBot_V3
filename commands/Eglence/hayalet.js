const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Hercai } = require('hercai');
const hercai = new Hercai({}); // DÜZELTME BURADA: Parantez içine {} eklendi

module.exports = {
    data: new SlashCommandBuilder().setName('hayal-et').setDescription('AI Resim Çiz').addStringOption(o=>o.setName('ne').setDescription('Prompt').setRequired(true)),
    async execute(i) {
        await i.deferReply();
        try {
            const res = await hercai.drawImage({model:"v3", prompt:i.options.getString('ne')});
            i.editReply({embeds:[new EmbedBuilder().setImage(res.url)]});
        } catch(e) { 
            console.log(e);
            i.editReply("Resim çizilirken bir hata oluştu."); 
        }
    }
};