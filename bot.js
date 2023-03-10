const dotenv = require('dotenv');
dotenv.config();
const token = process.env.DISCORD_TOKEN;

const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');

const fs = require('node:fs');
const path = require('node:path');

const cron = require('cron');
const LRH = require('./lib/LospecRequestHelper')
// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

//load the commands from the command folder
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
}


// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'

//run the lospec daily cron job
client.once(Events.ClientReady, c => {
    const guild = process.env.GUILD_ID
    const channel = process.env.CHANNEL_ID
    console.log(`Ready! Logged in as ${c.user.tag}`);

    //for now I'll set it to 8 o'clock in the morning amsterdam time
    let scheduledMessage = new cron.CronJob('0 8 * * *', () => {



        //get the info from lospec:
        //the daily tag
        //the daily pallette
        //the daily pallette as an attatchment

        LRH.getLospecDaily((dailytag,
            dailypallette,
            paletteGPLfile,
            palettePNGfile) => {
            LRH.sendLospecDaily(client, guild, channel, dailytag, dailypallette, paletteGPLfile, palettePNGfile);
        });
    });

    // When you want to start it, use:
    scheduledMessage.start();
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

// Log in to Discord with your client's token
client.login(token);