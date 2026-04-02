let currentLang = 'en';
let translations = {};

async function loadTranslations() {
    async function parseYAML(filePath) {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`文件加载失败：${response.status}`);
        const yamlText = await response.text();
        const result = {};
        let currentObj = result;
        const stack = [];
        const lines = yamlText.split('\n');
        lines.forEach(line => {
            line = line.trimEnd();
            if (!line || line.startsWith('#')) return;
            const match = line.match(/^(\s*)([^:]+):(.*)$/);
            if (match) {
                const indent = match[1].length;
                const key = match[2].trim();
                let value = match[3].trim();
                while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
                    stack.pop();
                    currentObj = stack.length > 0 ? stack[stack.length - 1].obj : result;
                }
                if (value) {
                    currentObj[key] = value.replace(/^["']|["']$/g, '');
                } else {
                    const newObj = {};
                    currentObj[key] = newObj;
                    stack.push({ indent, obj: newObj });
                    currentObj = newObj;
                }
            }
        });
        return result;
    }
    try {
        translations.en = await parseYAML("/lang/en.yml");
        translations.zh = await parseYAML("/lang/zh.yml");
    } catch (error) {
        console.log(error)
    }
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
        element.textContent = result || key;
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
