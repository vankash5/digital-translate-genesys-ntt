import config from './config.js';

// Genesys Cloud Language Code to AWS Translate Language Code
const languageCodeMapping = {
    'cs': 'cs',
    'da': 'da',
    'de': 'de',
    'en-us': 'en',
    'es': 'es',
    'fr': 'fr',
    'it': 'it',
    'nl': 'nl',
    'no': 'no',
    'pl': 'pl',
    'pt-br': 'pt',
    'fi': 'fi',
    'sv': 'sv',
    'tr': 'tr',
    'th': 'th',
    'ja': 'ja',
    'zh-cn': 'zh',
    'zh-tw': 'zh-TW'
};

function createTranslationParam(text, sourceLanguage, targetLanguage) {
    const source_language = languageCodeMapping[sourceLanguage] || sourceLanguage || 'auto';
    const target_language = languageCodeMapping[targetLanguage] || targetLanguage;

    return {
        raw_text: text,
        source_language,
        target_language
    };
}

export default {
    async translateText(text, sourceLanguage, targetLanguage) {
        const data = createTranslationParam(text, sourceLanguage, targetLanguage);
        console.info('translateText', data);
        try {
            const response = await fetch(`${config.translateServiceURI}/translate`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
            const translationData = await response.json();
            console.info('translateText->', translationData);
            return translationData;
        } catch (err) {
            console.error('Translation error:', err);
            return {
                translated_text: `Translation error: ${err.message}`,
                source_language: data.source_language,
            };
        }
    },
    async translateTextBatch(translationItems) {
        const data = translationItems.map(
            ({ text, sourceLanguage, targetLanguage }) => createTranslationParam(text, sourceLanguage, targetLanguage)
        );
        console.info('translateTextBatch', data);
        try {
            const response = await fetch(`${config.translateServiceURI}/translate-batch`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                });
            const translationData = await response.json();
            console.info('translateTextBatch->', translationData);
            return translationData;
        } catch (err) {
            console.error('Translation error:', err);
            return [{
                translated_text: `Translation error: ${err.message}`,
                source_language: data.source_language,
            }];
        }
    }
};
