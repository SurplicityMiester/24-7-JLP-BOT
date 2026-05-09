const { Client, GatewayIntentBits } = require('discord.js');
const { Manager } = require('moonlink.js');

// Store your token in a .env file: TOKEN=your_token_here
// Run with: node -r dotenv/config bot.js
const TOKEN = process.env.DISCORD_TOKEN;

const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.GuildMembers  // ← add this
    ]
  });

const manager = new Manager({
    nodes: [                          // ← must be under a "nodes" key
      {
        host: 'localhost',
        port: 2333,
        password: 'youshallnotpass',
        secure: false
      }
    ],
    clientName: 'JLP bot',
    send: (id, payload) => {
      const guild = client.guilds.cache.get(id);
      if (guild) guild.shard.send(payload);
    }
  });

  client.once('ready', async (c) => {
  console.log(`Logged in as ${client.user.tag}`); // Fix: backticks for template literal
  manager.init(c.user.id);
  
  // Fix: register slash command inside the single ready handler
  
  await client.application.commands.create({
    name: 'join',
    description: 'Join your voice channel and play the playlist'
  });
});

client.on('raw', (d) => manager.packetUpdate(d)); // different method name in moonlink

async function play(channel) {

     console.log('Manager nodes type:', typeof manager.nodes);
  console.log('Manager nodes:', JSON.stringify(manager.nodes));
  console.log('Manager keys:', Object.keys(manager));

    const player = manager.players.create({
      guildId: channel.guild.id,        // ← "guildId" not "guild"
      voiceChannelId: channel.id,       // ← "voiceChannelId" not "voiceChannel"
      textChannelId: null,
      autoPlay: true
    });
  
    await player.connect();
  
    const res = await manager.search({
      query: 'https://music.youtube.com/playlist?list=PLVqjzIOc_QoNYs7rgye3uaXkmziRdj8mU',
      requester: channel.guild.members.me
    });
  
    if (res.loadType === 'playlist') {   // ← v4 uses lowercase
      player.queue.add(res.tracks);
      console.log(`Loaded ${res.tracks.length} tracks`);
    } else {
      console.log('Failed to load playlist, loadType was:', res.loadType);
      return;
    }
  
    if (!player.playing && !player.paused) {
      player.play();
    }
  }

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'join') {
    const channel = interaction.member?.voice?.channel;

    if (!channel) {
      return interaction.reply({ content: 'Join a voice channel first.', ephemeral: true });
    }

    await interaction.reply('Joining and playing playlist...');

    // Fix: catch errors from async play() so they don't go unhandled
    play(channel).catch((err) => {
      console.error('Playback error:', err);
      interaction.followUp('Something went wrong while trying to play.').catch(() => {});
    });
  }
});

manager.on('trackEnd', (player) => {
  if (player.queue.size > 0) {
    player.play();
  }
});

// Added: handle track errors so the bot doesn't silently stall
manager.on('trackError', (player, track, payload) => {
  console.error(`Track error on "${track.title}":`, payload.exception);
  if (player.queue.size > 0) {
    player.play(); // skip to next track
  }
});

client.login(TOKEN);