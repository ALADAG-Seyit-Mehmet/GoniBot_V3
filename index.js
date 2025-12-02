require('dotenv').config();
const { Client, Collection, GatewayIntentBits, Partials } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildPresences, // <--- İŞTE BU EKSİKTİ! (Çevrim içi durumu görmek için şart)
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessageReactions
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

client.commands = new Collection();

// Hata Bastırıcı
process.on('unhandledRejection', (reason, p) => console.log('[Anti-Crash]', reason));
process.on('uncaughtException', (err, origin) => console.log('[Anti-Crash]', err));

// Handlerları Yükle
['commandHandler', 'eventHandler'].forEach(handler => require(`./handlers/${handler}`)(client));

if (!process.env.TOKEN) {
    console.log("❌ HATA: .env dosyasına TOKEN girmemişsin!");
    process.exit(1);
}
client.login(process.env.TOKEN);