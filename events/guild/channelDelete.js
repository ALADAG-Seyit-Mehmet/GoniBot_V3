const { AuditLogEvent, EmbedBuilder } = require('discord.js');
const db = require('croxydb');

// Basit Limit Sistemi (Map)
const silmeLimiti = new Map();

module.exports = {
    name: 'channelDelete',
    async execute(channel, client) {
        // Logu bul
        const fetchedLogs = await channel.guild.fetchAuditLogs({
            limit: 1,
            type: AuditLogEvent.ChannelDelete,
        });
        const deletionLog = fetchedLogs.entries.first();
        if (!deletionLog) return;

        const { executor } = deletionLog;
        if (executor.id === client.user.id) return; // Bot sildiyse (ticket vb) sorun yok.

        // Limit Kontrolü (10 saniyede 3 kanal silerse BAN)
        const now = Date.now();
        const userData = silmeLimiti.get(executor.id) || { count: 0, time: now };

        if (now - userData.time > 10000) {
            userData.count = 1;
            userData.time = now;
        } else {
            userData.count++;
        }
        silmeLimiti.set(executor.id, userData);

        if (userData.count >= 3) {
            // CEZA İŞLEMİ
            const member = channel.guild.members.cache.get(executor.id);
            if (member && member.bannable) {
                member.ban({ reason: 'GoniBot Güvenlik: Kanal Silme Saldırısı (Anti-Raid)' });
                
                // Log Kanalına Bildir
                const logID = db.fetch(`logKanal_${channel.guild.id}`);
                const logCh = channel.guild.channels.cache.get(logID);
                if(logCh) {
                    logCh.send({ content: `🚨 **SALDIRI TESPİT EDİLDİ!**\n**${executor.tag}** çok hızlı kanal sildiği için sunucudan yasaklandı!` });
                }
            }
        }
    }
};