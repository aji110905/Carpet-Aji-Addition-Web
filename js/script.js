let currentLang = 'en';
let translations = {};

async function loadTranslations() {
    //TODO: Load translations from YAML files
    function parseYAML(yaml) {
        const result = {};
        const lines = yaml.split('\n');
        let currentObj = result;
        let stack = [];
        lines.forEach(line => {
            line = line.trim();
            if (!line || line.startsWith('#')) return;
            const match = line.match(/^(\s*)([^:]+):(.*)$/);
            if (match) {
                const indent = match[1].length;
                const key = match[2].trim();
                const value = match[3].trim();
                while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
                    stack.pop();
                    currentObj = stack.length > 0 ? stack[stack.length - 1].obj : result;
                }
                if (value) {
                    currentObj[key] = value.replace(/^"|"$/g, '');
                } else {
                    const newObj = {};
                    currentObj[key] = newObj;
                    stack.push({ indent, obj: currentObj });
                    currentObj = newObj;
                }
            }
        });

        return result;
    }
    translations.en = parseYAML(enYAML);
    translations.zh = parseYAML(zhYAML);
    updateLanguage();
}

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
        if (result) {
            element.textContent = result;
        }
    });
}

function switchLanguage(lang) {
    currentLang = lang;
    updateLanguage();
    localStorage.setItem('language', lang);
}

document.addEventListener('DOMContentLoaded', function() {
    currentLang = localStorage.getItem('language') || 'en';
    loadTranslations();
    document.querySelectorAll('.lang-switcher').forEach(button => {
        button.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang-code');
            switchLanguage(lang);
        });
    });
});
