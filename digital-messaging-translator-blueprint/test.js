function getPort(defaultPort) {
    return parseInt(process.env.PORT || `${defaultPort}`);
}

function getUrl() {
    const proto = process.env.HTTPS ? 'https' : 'http';
    const host = process.env.HOST || '0.0.0.0';
    const port = process.env.HTTPS ? getPort(443) : getPort(80);
    return `${proto}://${host}:${port}`;
}
const axios = require('axios').create({
    baseURL: getUrl(),
    validateStatus: () => true,
});

class HTTPError extends Error {
    constructor(response) {
        super();
        this.status = response.status;
        this.message = `HTTP Error ${this.status}, ${response.data?.message}`;
    }
}

function ok(response) {
    if (response.status >= 200 && response.status <= 300)
        return response.data;
    throw new HTTPError(response);
}

describe('Translation service tests', () => {
    it('translate en-pt', async () => {
        const response = await axios.post('/translate', {
            source_language: 'en',
            target_language: 'pt',
            raw_text: 'Do you have kids?'
        });
        const data = ok(response);
        expect(data.source_language).toBe('en');
        expect(data.translated_text).toBe('Você tem filhos?');
    });
    it('translate en-pt with empty messages', async () => {
        const response = await axios.post('/translate', {
            source_language: 'en',
            target_language: 'pt',
            raw_text: ''
        });
        const data = ok(response);
        expect(data.source_language).toBe('en');
        expect(data.translated_text).toBe('');
    });
    it('translate pt-en', async () => {
        const response = await axios.post('/translate', {
            source_language: 'pt',
            target_language: 'en',
            raw_text: 'Você tem filhos?'
        });
        const data = ok(response);
        expect(data.source_language).toBe('pt');
        expect(data.translated_text).toBe('Do you have children?');
    });
    it('translate-batch pt,es-en', async () => {
        const response = await axios.post('/translate-batch', [{
            source_language: 'pt',
            target_language: 'en',
            raw_text: 'Você tem filhos?'
        },
        {
            source_language: 'es',
            target_language: 'en',
            raw_text: '¿Tienes hijos?'
        }]);
        const data = ok(response);
        expect(data[0].source_language).toBe('pt');
        expect(data[0].translated_text).toBe('Do you have children?');
        expect(data[1].source_language).toBe('es');
        expect(data[1].translated_text).toBe('Do you have children?');
    });
    it('translate-batch en-pt,es', async () => {
        const response = await axios.post('/translate-batch', [{
            source_language: 'en',
            target_language: 'pt',
            raw_text: 'Do you have children?'
        },
        {
            source_language: 'en',
            target_language: 'es',
            raw_text: 'Do you have children?'
        }]);
        const data = ok(response);
        expect(data[0].source_language).toBe('en');
        expect(data[0].translated_text).toBe('Você tem filhos?');
        expect(data[1].source_language).toBe('en');
        expect(data[1].translated_text).toBe('¿Tiene hijos?');
    });
    it('translate-batch en-pt,es', async () => {
        const response = await axios.post('/translate-batch', [{
            source_language: 'en',
            target_language: 'pt',
            raw_text: 'Do you have children?'
        },
        {
            source_language: 'en',
            target_language: 'es',
            raw_text: 'Do you have children?'
        }]);
        const data = ok(response);
        expect(data[0].source_language).toBe('en');
        expect(data[0].translated_text).toBe('Você tem filhos?');
        expect(data[1].source_language).toBe('en');
        expect(data[1].translated_text).toBe('¿Tiene hijos?');
    });
    it('translate-batch en-pt,es with empty messages', async () => {
        const response = await axios.post('/translate-batch', [{
            source_language: 'en',
            target_language: 'pt',
            raw_text: 'Do you have children?'
        },
        {
            source_language: 'en',
            target_language: 'es',
            raw_text: ''
        }]);
        const data = ok(response);
        expect(data[0].source_language).toBe('en');
        expect(data[0].translated_text).toBe('Você tem filhos?');
        expect(data[1].source_language).toBe('en');
        expect(data[1].translated_text).toBe('');
    });
});