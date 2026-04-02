let currentLang = 'en';
let translations = {};

function updateLanguage() {
    document.querySelectorAll('[data-lang]').forEach(element => {
        const key = element.getAttribute('data-lang');
        const keys = key.split('.');
        let result = translations[currentLang];
        for (const k of keys) {
            if (result && result[k] !== undefined) {
                result = result[k];
            } else {
                const index = parseInt(k);
                if (!isNaN(index) && Array.isArray(result) && result[index] !== undefined) {
                    result = result[index];
                } else {
                    result = key;
                    break;
                }
            }
        }
        element.textContent = result || key;
    });
}

function switchLanguage(lang) {
    currentLang = lang;
    updateLanguage();
    localStorage.setItem('language', lang);
}

document.addEventListener('DOMContentLoaded', async function () {
    currentLang = localStorage.getItem('language') || 'en';
    translations.en = await (await fetch("https://aji110905.github.io/Carpet-Aji-Addition-Web/assets/lang/en.json")).json();
    translations.zh = await (await fetch("https://aji110905.github.io/Carpet-Aji-Addition-Web/assets/lang/zh.json")).json();
    updateLanguage();
    document.querySelectorAll('.lang-switcher').forEach(button => {
        button.addEventListener('click', function () {
            const lang = this.getAttribute('data-lang-code');
            switchLanguage(lang);
        });
    });
});
