const { ChannelType, PermissionsBitField, EmbedBuilder } = require('discord.js');
const db = require('croxydb');

module.exports = {
    name: 'voiceStateUpdate',
    async execute(oldState, newState, client) {
        const guild = newState.guild || oldState.guild;
        
        // --- 1. SES LOG SİSTEMİ ---
        const logID = db.fetch(`logKanal_${guild.id}`);
        if (logID) {
            const logCh = guild.channels.cache.get(logID);
            if (logCh) {
                let logMsg = "";
                const user = newState.member.user;

                // Kanala Katıldı
                if (!oldState.channelId && newState.channelId) {
                    logMsg = `🔊 **${user.tag}** sese girdi: <#${newState.channelId}>`;
                }
                // Kanaldan Çıktı
                else if (oldState.channelId && !newState.channelId) {
                    logMsg = `🔇 **${user.tag}** sesten çıktı: <#${oldState.channelId}>`;
                }
                // Kanal Değiştirdi
                else if (oldState.channelId && newState.channelId && oldState.channelId !== newState.channelId) {
                    logMsg = `🔀 **${user.tag}** yer değiştirdi: <#${oldState.channelId}> ➡️ <#${newState.channelId}>`;
                }
                // Kamera/Yayın Açtı
                else if (!oldState.streaming && newState.streaming) logMsg = `📺 **${user.tag}** yayın açtı!`;
                else if (!oldState.selfVideo && newState.selfVideo) logMsg = `📷 **${user.tag}** kamerasını açtı!`;

                if (logMsg) logCh.send(logMsg).catch(()=>{});
            }
        }

        // --- 2. JOIN TO CREATE (Ses Ustası) ---
        // Bu sistem için panelden 'sys_welcome' gibi bir ayar yapmadıysak manuel ID kontrolü yapılabilir
        // veya veritabanında 'joinCreate_SUNUCUID' varsa çalışır.
        const joinID = db.fetch(`joinCreate_${guild.id}`);
        if (joinID && newState.channelId === joinID) {
            const user = newState.member.user;
            const parent = newState.channel.parentId;
            
            const created = await guild.channels.create({
                name: `🔊 ${user.username}'in Odası`,
                type: ChannelType.GuildVoice,
                parent: parent,
                permissionOverwrites: [{ id: user.id, allow: [PermissionsBitField.Flags.ManageChannels] }]
            });
            
            newState.setChannel(created);
            db.set(`tempChannel_${created.id}`, true);
        }

        // Boşalan Odayı Sil
        if (oldState.channelId && db.fetch(`tempChannel_${oldState.channelId}`)) {
            if (oldState.channel.members.size === 0) {
                oldState.channel.delete().catch(()=>{});
                db.delete(`tempChannel_${oldState.channelId}`);
            }
        }
    }
};