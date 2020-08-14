'use strict';
const path = require('path');
const express = require('express');
const http = require('http');

const app = express();
const portti = process.env.PORT || 4000;
const host = process.env.HOST || 'localhost';

const palvelin = http.createServer(app);

const palvelinvirhe = req => res.status(500).render('virhesivu', {
    viesti: 'Palvelimen virhe'
});

const optiot = {
    host: 'localhost',
    port: 3306,
    user: 'rauha',
    password: 'WfXuBbym',
    database: 'kukkatietokanta'
};

const Kukkakanta = require('./kukkavarasto.js');
const kukka = new Kukkakanta(optiot);

const valikkopolku = path.join(__dirname, 'valikko.html');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'sivumallit'));

/* const haeKaikkiSql = 'select kukanTunniste, laji, viljelija, viljelija, kasvupaikka from kukka'; */

app.use(express.static(path.join(__dirname, 'sivumallit')));

app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => res.sendFile(valikkopolku));
/* const haeKaikkiSql = 'select kukanTunniste, laji, viljelija, viljelija, kasvupaikka from kukka'; */
app.get('/kaikki', async (req, res) => {
    try {
        const tulos = await kukka.haeKaikki();
        res.render('haeKaikki', { kukka: tulos });
    }
    catch (virhe) {
        res.render('virhesivu', { viesti: virhe.message });
    }
});

app.get('/hae', (req, res) => {
    res.render('haeKukka', {
        paaotsikko: 'Kukan haku',
        otsikko: 'Syötä kukanTunniste',
        toiminto: '/hae'
    });
});

app.post('/hae', async (req, res) => {
    if (!req.body) {
        palvelinvirhe(res);
    }
    else {
        try {
            const tulos = await kukka.hae(req.body.kukanTunniste);
            if (tulos.viesti) {
                res.render('tilasivu', {
                    paaotsikko: 'Hakutulos',
                    otsikko: 'Viesti',
                    viesti: tulos.viesti
                });
            } else {
                res.render('hakutulos', {
                    kukka: tulos
                });
            }
        } catch (virhe) {
            res.render('virhesivu', {
                viesti: virhe.message
            });
        }
    }
});
//lähettää poistolomakkeen selaimeen
app.get('/poista', (req, res) => {
    res.render('haeKukka', {
        paaotsikko: 'Kukan haku',
        otsikko: 'Syötä kukanTunniste',
        toiminto: '/poista'
    });
});
//Käsitellään lomakkeelta tuleva tieto ja suoritetaan poisto
app.post('/poista', async (req, res) => {
    if (!req.body) {
        palvelinvirhe(res);
    } else {
        try {
            const tulos = await kukka.poista(req.body.kukanTunniste);
            res.render('tilasivu', {
                paaotsikko: 'Poiston tulos',
                otsikko: 'Viesti',
                viesti: tulos.viesti
            });
        }
        catch (virhe) {
            res.render('virhesivu', { viesti: virhe.message });
        }
    }
});
//lähettää lomakkeen selaimeen
app.get('/lisaa', (req, res) => {
    res.render('lomake', {
        paaotsikko: 'Kukan lisäys',
        otsikko: 'Syötä tiedot',
        toiminto: '/lisaa',
        kukanTunniste: { arvo: '', vainluku: '' },
        laji: { arvo: '', vainluku: '' },
        viljelija: { arvo: '', vainluku: '' },
        lukumaara: { arvo: '', vainluku: '' },
        kasvupaikka: { arvo: '', vainluku: '' }
    });
});
//käsittelee lomakkeelta tulevan tiedon ja vie Kukavarastoon
app.post('/lisaa', async (req, res) => {
    if (!req.body) {
        palvelinvirhe(res);
    } else {
        try {
            if (req.body.kukanTunniste && req.body.laji) {
                const tulos = await kukka.lisaa(req.body);
                res.render('tilasivu', {
                    paaotsikko: 'Lisäyksen tulos',
                    otsikko: 'Viesti',
                    viesti: tulos.viesti
                });
            }
            else {
                res.redirect('/lisaa');
            }
        }
        catch (virhe) {
            res.render('virhesivu', { viesti: virhe.message });
        }
    }
});
//lähettää lomakkeen selaimeen
app.get('/paivita', (req, res) => {
    res.render('lomake', {
        paaotsikko: 'Kukan päivitys',
        otsikko: 'Syötä tiedot',
        toiminto: '/paivita',
        kukanTunniste: { arvo: '', vainluku: '' },
        laji: { arvo: '', vainluku: 'readonly' },
        viljelija: { arvo: '', vainluku: 'readonly' },
        lukumaara: { arvo: '', vainluku: 'readonly' },
        kasvupaikka: { arvo: '', vainluku: 'readonly' }
    });
});
//hakee lomakkeelta tulevan kukanTunniste:n perusteella Kukan
//ja lähettää Kukan tiedoilla täytetyn lomakkeen selaimeen
app.post('/paivita', async (req, res) => {
    if (!req.body) {
        palvelinvirhe(res);
    } else {
        try {
            const tulos = await kukka.hae(req.body.kukanTunniste);
            if (tulos.viesti) {
                res.render('tilasivu', {
                    paaotsikko: 'Hakutulos',
                    otsikko: 'Viesti',
                    viesti: tulos.viesti
                });
            } else {
                res.render('lomake', {
                    paaotsikko: 'Kukan päivitys',
                    otsikko: 'Syötä tiedot',
                    toiminto: '/paivitatiedot',
                    kukanTunniste: { arvo: tulos.kukanTunniste, vainluku: 'readonly' },
                    laji: { arvo: tulos.laji, vainluku: '' },
                    viljelija: { arvo: tulos.viljelija, vainluku: '' },
                    lukumaara: { arvo: tulos.lukumaara, vainluku: '' },
                    kasvupaikka: { arvo: tulos.kasvupaikka, vainluku: '' }
                });
            }
        }
        catch (virhe) {
            res.render('virhesivu', { viesti: virhe.message });
        }
    }
});
//päivittää Kukavarastoon lomakkeelta tulevan
//muokatun Kuka - olion
app.post('/paivitatiedot', async (req, res) => {
    if (!req.body) {
        palvelinvirhe(res);
    } else {
        try {
            const tulos = await kukka.paivita(req.body);
            res.render('tilasivu', {
                paaotsikko: 'Päivityksen tulos',
                otsikko: 'Viesti',
                viesti: tulos.viesti
            });
        }
        catch (virhe) {
            res.render('virhesivu', { viesti: virhe.message });
        }
    }
});
palvelin.listen(portti, host, () =>
    console.log(`Palvelin ${host} palvelee portissa ${portti}.`)
);