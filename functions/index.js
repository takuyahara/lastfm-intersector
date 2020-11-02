const functions = require(`firebase-functions`);
const express = require(`express`);
const engines = require(`consolidate`);
const fetch = require('node-fetch');

const app = express();
app.engine(`pug`, engines.pug);
app.set(`views`, `./views`);
app.set(`view engine`, `pug`);

app.get([`/`, `/:artist`], (request, response) => {
    response.set(`Cache-Control`, `public, max-age=300, s-maxage=600`);
    response.render(`index`, {});
})
app.get(`/:artist/search`, (request, response) => {
    const getEpSimilar = function(artist) {
        const LIMIT = 250;
        const API_KEY = `b25b959554ed76058ac220b7b2e0a026`;
        return [
            `http://ws.audioscrobbler.com/2.0/?method=artist.getsimilar`,
            `&artist=${artist}`,
            `&limit=${LIMIT}`,
            `&api_key=${API_KEY}`,
            `&format=json`
        ].join(``);
    }
    const result = (async function() {
        const artist = request.params.artist;
        const epSimilar = getEpSimilar(artist);
        const result = await fetch(epSimilar);
        const resultJson = await result.json();
        const artistExists = resultJson.hasOwnProperty(`similarartists`);
        const similar = artistExists ? resultJson.similarartists.artist.map(a => ({
            name: a.name,
            match: a.match,
            url: a.url,
        })) : [];
        return { artist, similar };
    })();
    result.then(r => {
        response.type(`json`).json(r);
    });
})
app.use(function(request, response){
    response.redirect(`/`);
});

exports.app = functions.https.onRequest(app);
