// import bullshit
const { Client, GuildMember, GatewayIntentBits } = require("discord.js");
const { Player, QueryType } = require("discord-player");
const config = require("./config.json");

// main int

const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildVoiceStates
    ]
});

client.on('ready', () => {
 console.log('Ready!');
 client.user.setActivity({
   name: "Bruh"
 });
});

client.on("error", console.error);
client.on("warn", console.warn);

const player = new Player(client);

//messages

player.on("error",(queue, error) => {
  console.log (`[${queue.guild.name}] Error emitted from the queue, L+ratio: ${error.message}`);
});
player.on("connectionError",(queue, error) => {
  console.log (`[${queue.guild.name}] Error emitted from the connection, albanian internet: ${error.message}`);
});
player.on("trackStart", (queue, track) => {
    queue.metadata.send(`🎶 | Started playing: **${track.title}** in **${queue.connection.channel.name}**!`);
});

player.on("trackAdd", (queue, track) => {
    queue.metadata.send(`🎶 | Track **${track.title}** queued!`);
});

player.on("botDisconnect", (queue) => {
    queue.metadata.send("❌ | I was manually kicked, clearing que!");
});

player.on("channelEmpty", (queue) => {
    queue.metadata.send("❌ | Dead server XD, disconected!");
});

player.on("queueEnd", (queue) => {
    queue.metadata.send("✅ | That's all folks!");
});

//slash commands

client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.guild) return;
    if (!client.application?.owner) await client.application?.fetch();

    if (message.content === "!deploy" && message.author.id === client.application?.owner?.id) {
        await message.guild.commands.set([
            {
                name: "play",
                description: "Plays a song from youtube",
                options: [
                    {
                        name: "query",
                        type: "STRING",
                        description: "The song you want to play",
                        required: true
                    }
                ]
            },
            {
                name: "skip",
                description: "Skip to the current song"
            },
            {
                name: "queue",
                description: "See the queue"
            },
            {
                name: "stop",
                description: "Stop the player"
            },
        ]);

        await message.reply("Deployed!");
    }
});

// defining interactions

client.on("interactionCreate", async (interaction) => {
    if (!interaction.isCommand() || !interaction.guildId) return;

    if (!(interaction.member instanceof GuildMember) || !interaction.member.voice.channel) {
        return void interaction.reply({ content: "You are not in a voice channel!", ephemeral: true });
    }

    if (interaction.guild.me.voice.channelId && interaction.member.voice.channelId !== interaction.guild.me.voice.channelId) {
        return void interaction.reply({ content: "You are not in my voice channel!", ephemeral: true });
    }
    if (interaction.commandName === "play") {
      await interaction.deferReply();

    const query = interaction.options.get("query").value;
    const searchResult = await player
        .search(query, {
            requestedBy: interaction.user,
            searchEngine: QueryType.AUTO
        })
        .catch(() => {});
    if (!searchResult || !searchResult.tracks.length) return void interaction.followUp({ content: "No bitches!" });
    const queue = await player.createQueue(interaction.guild, {
        metadata: interaction.channel
    });

    try {
        if (!queue.connection) await queue.connect(interaction.member.voice.channel);
    } catch {
        void player.deleteQueue(interaction.guildId);
        return void interaction.followUp({ content: "Could not join your voice channel!" });
    }

    await interaction.followUp({ content: `⏱ | Loading your ${searchResult.playlist ? "playlist" : "track"}...` });
    searchResult.playlist ? queue.addTracks(searchResult.tracks) : queue.addTrack(searchResult.tracks[0]);
    if (!queue.playing) await queue.play();
    }
    else if (interaction.commandName === "skip") {
        await interaction.deferReply();
        const queue = player.getQueue(interaction.guildId);
        if (!queue || !queue.playing) return void interaction.followUp({ content: "❌ | No music is being played!" });
        const currentTrack = queue.current;
        const success = queue.skip();
        return void interaction.followUp({
            content: success ? `✅ | Skipped **${currentTrack}**!` : "❌ | Something went wrong!"
          });
        }
    else if (interaction.commandName === "stop") {
        await interaction.deferReply();
        const queue = player.getQueue(interaction.guildId);
        if (!queue || !queue.playing) return void interaction.followUp({ content: "❌ | No music is being played!" });
        queue.destroy();
        return void interaction.followUp({ content: "🛑 | Stopped the player!" });
        }
    else {
        interaction.reply({
            content: "Unknown command!",
            ephemeral: true
        });
    }
});

client.login(config.token);
