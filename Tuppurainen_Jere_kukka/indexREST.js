//indexREST.js
'use strict';

const http = require('http');
const express = require('express');
const cors = require('cors');

const app = express();

const port = process.env.PORT || 3000;
const host = process.env.HOST || 'localhost';

const palvelin = http.createServer(app);

const Tietovarasto = require('./kukkavarasto.js');

const optiot = {
    host: 'localhost',
    port: 3306,
    user: 'rauha',
    password: 'WfXuBbym',
    database: 'kukkatietokanta'
};

const kukat = new Tietovarasto(optiot);

app.use(express.json());
app.use(cors());


app.get('/', (req, res) => res.json({
    virhe: 'komento puuttuu'
}));

app.get('/kukat', (req, res) =>
    kukat.haeKaikki()
        .then(tulos => res.json(tulos))
        .catch(virhe => res.json({
            virhe: virhe.message
        }))
);

app.route('/kukat/:numero')
    .get((req, res) => {
        const autoId = req.params.numero;
        kukat.hae(autoId)
            .then(tulos => res.json(tulos))
            .catch(virhe => res.json({
                virhe: virhe.message
            }))
    })
    .delete((req, res) => {
        const autoId = req.params.numero;
        kukat.poista(autoId)
            .then(tulos => res.json(tulos))
            .catch(virhe => res.json({
                virhe: virhe.message
            }))
    })
    .post((req, res) => {
        if (!req.body) res.json({
            virhe: 'ei löydy'
        });
        kukat.paivita(req.body)
            .then(tulos => res.json(tulos))
            .catch(virhe => res.json({
                virhe: virhe.message
            }))
    })
    .put((req, res) => {
        if (!req.body) res.json({
            virhe: 'ei löydy'
        });
        kukat.lisaa(req.body)
            .then(tulos => res.json(tulos))
            .catch(virhe => res.json({
                virhe: virhe.message
            }))
    });
app.all('*', (req, res) =>
    res.json('resurssia ei löydy tai yksilöivä numero puuttuu')
);
palvelin.listen(port, host, () =>
    console.log(`Palvelin ${host} portissa ${port}`)
);