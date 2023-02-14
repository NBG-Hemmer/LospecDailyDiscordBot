const { SlashCommandBuilder } = require('discord.js');
const LRH = require('./../lib/LospecRequestHelper');
const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('manual')
        .setDescription('manually pulls the lospec daily'),
    async execute(interaction) {
        LRH.getLospecDaily((dailytag,
            dailypallette,
            paletteGPLfile,
            palettePNGfile) => {

            var today = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = today.getFullYear();

            today = mm + '/' + dd + '/' + yyyy;

            const LospecEmbed = new EmbedBuilder()
                .setColor('#FFA500')
                .setTitle(dailytag)
                .setDescription('Lospec Daily - ' + today)
                .addFields(
                    { name: 'Tag:', value: dailytag },
                    { name: 'Palette:', value: dailypallette },
                )
                .setImage('attachment://'+ palettePNGfile)

            interaction.reply({ embeds: [LospecEmbed], files: ["./LastDaily/" + paletteGPLfile, "./LastDaily/" +palettePNGfile] });
        });
    },
};