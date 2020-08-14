//rest.js
'use strict';
(function () {
    let metodi = 'GET';
    let jsonteksti;
    let urikentta;
    let tulosalue;
    document.addEventListener('DOMContentLoaded', alusta);
    function alusta() {
        jsonteksti = document.getElementById('jsonteksti');
        urikentta = document.getElementById('urikentta');
        tulosalue = document.getElementById('tulosalue');
        document.getElementById('GET').addEventListener('click', valitse);
        document.getElementById('POST').addEventListener('click', valitse);
        document.getElementById('PUT').addEventListener('click', valitse);
        document.getElementById('DELETE').addEventListener('click',
            valitse);
        document.getElementById('lahetaJson').addEventListener('click',
            laheta);
        urikentta.value = 'http://localhost:3000/kukat';
    }
    function valitse(e) {
        tulosalue.textContent = '';
        metodi = e.target.id;
    }
    async function laheta() {
        let optiot = {
            method: metodi,
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json'
            }
        };
        if (metodi === 'PUT' || metodi === 'POST') {
            optiot.body = jsonteksti.value;
        }
        try {
            const vastaus = await fetch(urikentta.value, optiot);
            const data = await vastaus.json();
            tulosalue.textContent = JSON.stringify(data);
        }
        catch (virhe) {
            console.log('Virhe' + virhe.message);
        }
    }
})();