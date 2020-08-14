'use strict';
const Tietokanta = require('./tietokanta.js');
const ohjelmavirhe = virhe => {
    if (virhe) console.log(virhe);
    return new Error('Ohjelmavirhe');
}
const autontiedot = kukka => [
    kukka.kukanTunniste, kukka.laji, kukka.viljelija,
    kukka.lukumaara, kukka.kasvupaikka
];
const autotiedotPaivitykseen = kukka => [
    kukka.laji, kukka.viljelija,
    kukka.lukumaara, kukka.kasvupaikka, kukka.kukanTunniste
];
//Sql-lauseet
const haeKaikkiSql = 'select kukanTunniste, laji, viljelija, lukumaara, kasvupaikka from kukka';
const haeAutoSql =
    'select kukanTunniste, laji, viljelija, lukumaara, kasvupaikka from kukka where kukanTunniste=?';
const lisaaAutoSql =
    'insert into kukka(kukanTunniste,laji, viljelija, lukumaara, kasvupaikka) values(?,?,?,?,?)';
const poistaAutoSql = 'delete from kukka where kukanTunniste=?';
const paivitaAutoSql =
    'update kukka set laji=?, viljelija=?, lukumaara=?, kasvupaikka=? where kukanTunniste=?';
//Autokanta-luokka
module.exports = class Autokanta {
    constructor(optiot) {
        this.varasto = new Tietokanta(optiot);
    }
    //metodit
    //palauttaa lupauksen
    haeKaikki() {
        return new Promise(async (resolve, reject) => {
            try {
                const tulos =
                    await this.varasto.suoritaKysely(haeKaikkiSql);
                if (tulos.tulosjoukko) {
                    resolve(tulos.kyselynTulos);
                }
                else {
                    reject(ohjelmavirhe());
                }
            }
            catch (virhe) {
                reject(ohjelmavirhe(virhe));
            }
        });
    }
    //palauttaa lupauksen
    hae(kukanTunniste) {
        return new Promise(async (resolve, reject) => {
            try {
                const tulos =
                    await this.varasto.suoritaKysely(haeAutoSql, [+kukanTunniste]);
                if (tulos.tulosjoukko) {
                    if (tulos.kyselynTulos.length > 0) {
                        resolve(tulos.kyselynTulos[0]);
                    }
                    else {
                        resolve({
                            viesti: `Numerolla ${kukanTunniste} ei löytynyt autoa`
                        });
                    }
                }
                else {
                    reject(ohjelmavirhe());
                }
            }
            catch (virhe) {
                reject(ohjelmavirhe(virhe));
            }
        });
    }
    //palauttaa lupauksen
    lisaa(kukka) {
        return new Promise(async (resolve, reject) => {
            try {
                const hakutulos =
                    await this.varasto.suoritaKysely(haeAutoSql,
                        [kukka.kukanTunniste]);
                if (hakutulos.kyselynTulos.length === 0) {
                    const tulos =
                        await this.varasto.suoritaKysely(lisaaAutoSql,
                            autontiedot(kukka));
                    if (tulos.kyselynTulos.muutetutRivitLkm === 1) {
                        resolve({
                            viesti: `kukka numerolla ${kukka.kukanTunniste} lisättiin`
                        });
                    }
                    else {
                        resolve({ viesti: 'Kukkaa ei lisätty' });
                    }
                }
                else {
                    resolve({
                        viesti: `kukanTunniste ${kukka.kukanTunniste} oli jo käytössä`
                    });
                }
            }
            catch (virhe) {
                reject(ohjelmavirhe(virhe));
            }
        });
    }
    //palauttaa lupauksen
    poista(kukanTunniste) {
        return new Promise(async (resolve, reject) => {
            try {
                const tulos =
                    await this.varasto.suoritaKysely(poistaAutoSql,
                        [+kukanTunniste]);
                if (tulos.kyselynTulos.muutetutRivitLkm === 0) {
                    resolve({
                        viesti: 'Antamallasi numerolla ei löytynyt ' +
                            'Kukkaa. Mitään ei poistettu'
                    });
                }
                else {
                    resolve({
                        viesti: `kukka numerolla ${kukanTunniste} poistettiin`
                    })
                }
            }
            catch (virhe) {
                reject(ohjelmavirhe(virhe))
            }
        });
    }
    //palauttaa lupauksen
    paivita(kukka) {
        return new Promise(async (resolve, reject) => {
            try {
                const tulos =
                    await this.varasto.suoritaKysely(paivitaAutoSql,
                        autotiedotPaivitykseen(kukka));
                if (tulos.kyselynTulos.muutetutRivitLkm === 0) {
                    resolve({ viesti: 'Tietoja ei päivitetty' });
                }
                else {
                    resolve({
                        viesti: `Kukan ${kukka.kukanTunniste} tiedot päivitettiin`
                    });
                }
            }
            catch (virhe) {
                reject(ohjelmavirhe(virhe));
            }
        });
    }
}