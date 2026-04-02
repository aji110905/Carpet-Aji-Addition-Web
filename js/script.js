let currentLang = 'en';
let translations = {};

async function loadTranslations() {
    async function parseYAML(filePath) {
        console.log('正在加载翻译文件:', filePath);
        const response = await fetch(filePath);
        console.log('响应状态:', response.status);
        if (!response.ok) throw new Error(`文件加载失败：${response.status} ${response.statusText}`);
        const yamlText = await response.text();
        console.log('加载的YAML内容:', yamlText);
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
        console.log('解析后的翻译数据:', result);
        return result;
    }
    try {
        // 尝试使用相对路径
        translations.en = await parseYAML("lang/en.yml");
        translations.zh = await parseYAML("lang/zh.yml");
        console.log('所有翻译文件加载完成:', translations);
        updateLanguage();
    } catch (error) {
        console.error('加载翻译文件失败:', error);
        // 尝试使用GitHub raw URL作为备选
        try {
            console.log('尝试使用GitHub raw URL加载...');
            translations.en = await parseYAML("https://raw.githubusercontent.com/aji110905/Carpet-Aji-Addition-Web/master/lang/en.yml");
            translations.zh = await parseYAML("https://raw.githubusercontent.com/aji110905/Carpet-Aji-Addition-Web/master/lang/zh.yml");
            console.log('使用GitHub raw URL加载成功:', translations);
            updateLanguage();
        } catch (secondError) {
            console.error('使用GitHub raw URL加载也失败:', secondError);
        }
    }
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
