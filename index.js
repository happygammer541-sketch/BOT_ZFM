require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

// 🔐 TOKEN CACHÉ (variable d’environnement)
const TOKEN = process.env.DISCORD_TOKEN;

// Nom EXACT du rôle muted
const MUTED_ROLE_NAME = "Muted";

// Détection simple de scams
const SCAM_KEYWORDS = [
  "http",
  "free nitro",
  "steam",
  "crypto",
  "airdrop",
  "giveaway"
];

client.once('ready', () => {
  console.log(`✅ Bot connecté : ${client.user.tag}`);
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (!message.guild) return;

  const member = message.member;
  const mutedRole = message.guild.roles.cache.find(
    r => r.name === MUTED_ROLE_NAME
  );
  if (!mutedRole) return;

  const content = message.content.toLowerCase();

  const hasLink = content.includes("http");
  const hasMassMention =
    message.mentions.everyone || content.includes("@here");
  const hasScamKeyword = SCAM_KEYWORDS.some(word =>
    content.includes(word)
  );

  if (hasLink || hasMassMention || hasScamKeyword) {
    await message.delete().catch(() => {});
    if (!member.roles.cache.has(mutedRole.id)) {
      await member.roles.add(mutedRole);
    }
    console.log(`🚫 ${member.user.tag} muted pour message suspect`);
  }
});

// Sécurité : si le token est absent
if (!TOKEN) {
  console.error("❌ DISCORD_TOKEN manquant");
  process.exit(1);
}

client.login(TOKEN);

