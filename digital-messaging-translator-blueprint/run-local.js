const https = require('https');
const http = require('http');
const fs = require('fs');
const express = require('express');
const { Translate } = require('@aws-sdk/client-translate');
require('dotenv').config();
const cors = require('cors');

function log(method, ...args) {
    console.log(new Date(), method, ...args);
}

function error(method, ...args) {
    console.error(new Date(), 'ERROR', method, ...args);
}
// Configure the AWS Translate client
const translateService = new Translate({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});
const app = express();

app.use(cors());
app.use(express.static('docs'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*
function createTranslateParams(SourceLanguageCode, TargetLanguageCode, Text) {
    return {
        Text,
        SourceLanguageCode,
        TargetLanguageCode,
        TerminologyNames: [
            'NoTranslation'
        ],
        Settings: {
            Formality: 'FORMAL',
            Profanity: 'MASK'
        }
    };
}*/

function createTranslateParams(SourceLanguageCode, TargetLanguageCode, Text) {
    return {
        Text,
        SourceLanguageCode,
        TargetLanguageCode
	};
}

app.post('/translate', async (req, res, next) => {
    try {
        const body = req.body;
        log('translate', body);
        const params = createTranslateParams(body.source_language, body.target_language, body.raw_text);
        // Use the translate service
        let response = {
            source_language: params.SourceLanguageCode,
            translated_text: ''
        };
        let statusCode = 200;
        if (params.Text) {
            const data = await translateService.translateText(params);
            statusCode = data['$metadata'].httpStatusCode;
            response = {
                source_language: data.SourceLanguageCode,
                translated_text: data.TranslatedText
            };
        }
        log('translate->', response);
        res.status(statusCode).json(response);
    } catch (err) {
        error('translate', err);
        next(err);
    }
});

app.post('/translate-batch', async (req, res, next) => {
    try {
        const body = req.body;
        log('translate-batch', body);
        const response = [];
        for (const item of body) {
            const params = createTranslateParams(item.source_language, item.target_language, item.raw_text);
            let responseItem = {
                source_language: params.SourceLanguageCode,
                translated_text: ''
            };
            if (params.Text) {
                const data = await translateService.translateText(params);
                responseItem = {
                    source_language: data.SourceLanguageCode,
                    translated_text: data.TranslatedText
                };
            }
            response.push(responseItem);
        }
        log('translate-batch->', response);
        res.status(200).json(response);
    } catch (err) {
        error('translate-batch', err);
        next(err);
    }
});

app.use((err, req, res, next) => {
    if (res.headersSent) {
        error('Error after response sent', err);
        return next(err);
    }
    log('Send Error:', err.message);
    res.status(err.$metadata.httpStatusCode).json({
        message: err.message
    });
});

function getPort(defaultPort) {
    return parseInt(process.env.PORT || `${defaultPort}`);
}

function getHost() {
    return process.env.HOST || '0.0.0.0';
}


function startHttpServer() {
    const host = getHost();
    const port = getPort(80);
    http.createServer(app)
        .listen(port, host, () => log(`HTTP listening on: ${host}:${port}`))
        .on('error', err => {
            error(err);
            process.exit(1);
        });
}

function startHttpsServer() {
    // Local ssl certificates
    const privateKey = fs.readFileSync('ssl/_localhost.key', 'utf8');
    const certificate = fs.readFileSync('ssl/_localhost.crt', 'utf8');
    const credentials = { key: privateKey, cert: certificate };
    const host = getHost();
    const port = getPort(443);
    https.createServer(credentials, app)
        .listen(port, host, () => log(`HTTPS listening on: ${host}:${port}`))
        .on('error', err => {
            error(err);
            process.exit(1);
        });
}

/*if (process.env['HTTPS']) startHttpsServer();
else startHttpServer();*/

startHttpServer();
