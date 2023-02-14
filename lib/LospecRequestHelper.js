
const httpRequest = require('./httprequest');
const EmbedBuilder = require('discord.js');

module.exports.getLospecDaily = (onFinish) => {
    const initialrequest = {
        host: 'lospec.com',
        port: 443,
        path: '/dailies/',
        method: 'GET',
    };

    let dailytag = "";
    let dailypallette = "";
    let paletteGPLfile = "";
    let palettePNGfile = "";

    httpRequest.getXML(initialrequest, (statusCode, result) => {
        let document = result.window.document;

        dailytag = document.querySelector("div.daily.tag").textContent;
        dailypallette = document.querySelector("div.daily.palette a").textContent;
        console.log(dailytag + " | " + dailypallette);

        //---------

        let palettefile = Array.from(document.querySelectorAll("div.daily.palette a"))
            .find(el => el.textContent === 'GPL').href;

        const paletterequest = initialrequest;
        paletterequest.path = palettefile


        httpRequest.getFile(paletterequest, (statusCode, filename) => {
            paletteGPLfile = filename;
            console.log("File: " + paletteGPLfile + " succesfully downloaded")
        

            //--------

            let paletteImage = Array.from(document.querySelectorAll("div.daily.palette a"))
            .find(el => el.textContent === 'PNG 32x').href;

            const paletteImageRequest = initialrequest;
            paletteImageRequest.path = paletteImage

        
            httpRequest.getFile(paletteImageRequest, (statusCode, filename) => {
                palettePNGfile = filename;
                console.log("File: " + palettePNGfile + " succesfully downloaded")
            
                onFinish(
                    dailytag, 
                    dailypallette, 
                    paletteGPLfile, 
                    palettePNGfile
                );
            });
        });
    });
}

module.exports.sendLospecDaily = function (client, GUILD_ID, CHANNEL_ID, dailytag, dailypallette, paletteGPLfile, palettePNGfile) {
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
        .setImage('attachment://' + palettePNGfile)

    let channel = client.channel.cache.get(CHANNEL_ID)
    channel.send({ embeds: [LospecEmbed], files: ["./LastDaily/" + paletteGPLfile, "./LastDaily/" + palettePNGfile] });
}