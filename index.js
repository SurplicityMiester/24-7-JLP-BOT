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
  nodes: [
    {
      host: 'localhost',
      port: 2333,
      password: 'youshallnotpass',
      secure: false
    }
  ],
  clientName: 'JLP bot',
  sendPayload: (guildId, payload) => {        // ← v5 uses sendPayload not send
    const guild = client.guilds.cache.get(guildId);
    if (guild) guild.shard.send(JSON.parse(payload));  // ← v5 passes a string, needs parsing
  }
});

  manager.on('nodeConnect', (node) => console.log('nodeConnect fired:', node.host))
manager.on('nodeReady', (node) => console.log('nodeReady fired:', node.host))
manager.on('nodeError', (node, err) => console.error('nodeError fired:', node.host, err.message))
manager.on('nodeDisconnect', (node) => console.warn('nodeDisconnect fired:', node.host))

 client.once('clientReady', async (c) => {
  console.log(`Logged in as ${c.user.tag}`)
  await manager.init(c.user.id)              // ← pass the ID string, not the whole client
  console.log('Manager initialized')

  await client.application.commands.create({
    name: 'join',
    description: 'Join your voice channel and play the playlist'
  })
})
client.on('raw', (d) => manager.packetUpdate(d)); // different method name in moonlink

async function play(channel) {
  const player = await manager.players.create({    // ← v5 create is async
    guildId: channel.guild.id,
    voiceChannelId: channel.id,
    textChannelId: null,
    autoPlay: true
  })

  await player.connect()

  const res = await manager.search(
    'https://music.youtube.com/playlist?list=PLVqjzIOc_QoNYs7rgye3uaXkmziRdj8mU',
    channel.guild.members.me                       // ← v5 search takes query then requester directly
  )

  if (res.loadType === 'playlist') {
    for (const track of res.tracks) {
      player.queue.add(track)                      // ← v5 add one at a time
    }
    console.log(`Loaded ${res.tracks.length} tracks`)
  } else {
    console.log('Failed to load, loadType was:', res.loadType)
    return
  }

  if (!player.playing && !player.paused) {
    await player.play()
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