import { Client, GatewayIntentBits, EmbedBuilder } from "discord.js";
import fetch from "node-fetch";
import config from "./config.json" assert { type: "json" };

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

async function getServerData() {
  const res = await fetch(
    `https://api.top-games.net/v1/server/${config.TOPGAMES_TOKEN}`
  );
  return await res.json();
}

async function updateEmbed() {
  try {
    const channel = await client.channels.fetch(config.CHANNEL_ID);
    const message = await channel.messages.fetch(config.MESSAGE_ID);

    const data = await getServerData();

    const embed = new EmbedBuilder()
      .setTitle(`🎮 ${data.name}`)
      .setColor(data.online ? 0x00ff00 : 0xff0000)
      .addFields(
        { name: "🏆 Platz", value: `#${data.rank}`, inline: true },
        { name: "⭐ Votes heute", value: `${data.votes_today}`, inline: true },
        { name: "⭐ Gesamt Votes", value: `${data.votes}`, inline: true },
        {
          name: "Status",
          value: data.online ? "🟢 Online" : "🔴 Offline",
          inline: true
        },
        {
          name: "Spieler",
          value: `${data.players.online} / ${data.players.max}`,
          inline: true
        }
      )
      .setFooter({ text: "SCUM Server • Top-Games" })
      .setTimestamp();

    await message.edit({ embeds: [embed] });
    console.log("Embed aktualisiert");
  } catch (err) {
    console.error("Fehler:", err);
  }
}

client.once("ready", () => {
  console.log(`Bot online als ${client.user.tag}`);
  updateEmbed();

  setInterval(
    updateEmbed,
    config.UPDATE_MINUTES * 60 * 1000
  );
});

client.login(config.DISCORD_TOKEN);
