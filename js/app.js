document.addEventListener('DOMContentLoaded', () => {
    const langToggle = document.getElementById('lang-toggle');
    let currentLang = localStorage.getItem('lang') || 'en';

    const contentElements = {
        // Landing Page
        'landing-title': document.getElementById('landing-title'),
        'landing-subtitle': document.getElementById('landing-subtitle'),
        'guide-cta': document.querySelector('a[href="/guide.html"]'),

        // Guide Page
        'sections-nav': document.getElementById('sections-nav'),
        'content-area': document.getElementById('content-area'),
        'sections-title': document.querySelector('aside h2'),
    };

    async function loadContent() {
        const response = await fetch('/data/content.json');
        const content = await response.json();
        updateText(content);
        if (window.location.pathname.includes('guide.html')) {
            populateSectionsNav(content);
            handleSectionSelection(content);
        }
    }

    function updateText(content) {
        const langContent = content[currentLang];
        if (contentElements['landing-title']) {
            contentElements['landing-title'].textContent = langContent.landing.title;
        }
        if (contentElements['landing-subtitle']) {
            contentElements['landing-subtitle'].textContent = langContent.landing.subtitle;
        }
        if (contentElements['guide-cta']) {
            contentElements['guide-cta'].textContent = langContent.guide_cta;
        }
        if (contentElements['sections-title']) {
            contentElements['sections-title'].textContent = langContent.sections_title;
        }

        langToggle.textContent = currentLang === 'en' ? 'FR' : 'EN';
    }

    function populateSectionsNav(content) {
        const sections = content[currentLang].sections;
        const sectionsNav = contentElements['sections-nav'];
        if (!sectionsNav) return;
        sectionsNav.innerHTML = '';
        for (const key in sections) {
            const listItem = document.createElement('li');
            const link = document.createElement('a');
            link.href = `#${key}`;
            link.textContent = sections[key].title;
            link.className = 'block px-4 py-2 text-gray-700 rounded-md hover:bg-gray-200';
            listItem.appendChild(link);
            sectionsNav.appendChild(listItem);
        }
    }

    function handleSectionSelection(content) {
        const sectionsNav = contentElements['sections-nav'];
        const contentArea = contentElements['content-area'];
        if (!sectionsNav || !contentArea) return;

        sectionsNav.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                e.preventDefault();
                const sectionKey = e.target.hash.substring(1);
                updateSectionContent(sectionKey, content);
            }
        });

        // Load default section
        const defaultSection = Object.keys(content[currentLang].sections)[0];
        updateSectionContent(defaultSection, content);
    }

    function updateSectionContent(sectionKey, content) {
        const section = content[currentLang].sections[sectionKey];
        const contentArea = contentElements['content-area'];
        if (section && contentArea) {
            contentArea.innerHTML = `
                <h2 class="text-3xl font-bold mb-4">${section.title}</h2>
                <p class="text-gray-700">${section.content}</p>
            `;
        }
    }

    langToggle.addEventListener('click', () => {
        currentLang = currentLang === 'en' ? 'fr' : 'en';
        localStorage.setItem('lang', currentLang);
        loadContent();
    });

    loadContent();
});
