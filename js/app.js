document.addEventListener("DOMContentLoaded", () => {
  const langToggle = document.getElementById("lang-toggle");
  let currentLang = localStorage.getItem("lang") || "en";
  let checkedSections =
    JSON.parse(localStorage.getItem("checkedSections")) || {};

  const contentElements = {
    // Landing Page
    "landing-title": document.getElementById("landing-title"),
    "landing-subtitle": document.getElementById("landing-subtitle"),
    "guide-cta": document.querySelector("#guide-cta"),

    // Guide Page
    "sections-nav": document.getElementById("sections-nav"),
    "content-area": document.getElementById("content-area"),
    "sections-title": document.querySelector("aside h2"),
  };

  async function loadContent() {
    try {
      const response = await fetch("data/content.json");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const content = await response.json();
      updateText(content);
      if (window.location.pathname.includes("guide.html")) {
        populateSectionsNav(content);
        handleSectionSelection(content);
      }
    } catch (error) {
      console.error("Could not load content:", error);
    }
  }

  function updateText(content) {
    const langContent = content[currentLang];
    if (contentElements["landing-title"]) {
      contentElements["landing-title"].textContent = langContent.landing.title;
    }
    if (contentElements["landing-subtitle"]) {
      contentElements["landing-subtitle"].textContent =
        langContent.landing.subtitle;
    }
    if (contentElements["guide-cta"]) {
      contentElements["guide-cta"].textContent = langContent.guide_cta;
    }
    if (contentElements["sections-title"]) {
      contentElements["sections-title"].textContent =
        langContent.sections_title;
    }

    langToggle.textContent = currentLang === "en" ? "FR" : "EN";
    document.documentElement.lang = currentLang;
  }

  function populateSectionsNav(content) {
    const sections = content[currentLang].sections;
    const sectionsNav = contentElements["sections-nav"];
    if (!sectionsNav) return;
    sectionsNav.innerHTML = ""; // Clear previous nav

    for (const key in sections) {
      const isChecked = checkedSections[key] || false;
      const listItem = document.createElement("li");
      listItem.className = "flex items-center p-2 rounded-md hover:bg-gray-200";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.id = `check-${key}`;
      checkbox.dataset.section = key;
      checkbox.className =
        "flex-shrink-0 mr-3 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500";
      checkbox.checked = isChecked;

      const label = document.createElement("label");
      label.htmlFor = `check-${key}`;
      label.className = `flex-grow cursor-pointer ${
        isChecked ? "line-through text-gray-400" : "text-gray-700"
      }`;

      const link = document.createElement("a");
      link.href = `#${key}`;
      link.textContent = sections[key].title;
      link.className = "block";

      label.appendChild(link);
      listItem.appendChild(checkbox);
      listItem.appendChild(label);
      sectionsNav.appendChild(listItem);
    }
  }

  function handleSectionSelection(content) {
    const sectionsNav = contentElements["sections-nav"];
    const contentArea = contentElements["content-area"];
    if (!sectionsNav || !contentArea) return;

    // Handle clicks on links for content update
    sectionsNav.addEventListener("click", (e) => {
      if (e.target.tagName === "A") {
        e.preventDefault();
        const sectionKey = e.target.hash.substring(1);
        updateSectionContent(sectionKey, content);

        // Update active styles
        document
          .querySelectorAll("#sections-nav a")
          .forEach((a) => a.classList.remove("font-bold", "text-blue-600"));
        e.target.classList.add("font-bold", "text-blue-600");
      }
    });

    // Handle clicks on checkboxes for state change
    sectionsNav.addEventListener("change", (e) => {
      if (e.target.type === "checkbox") {
        const sectionKey = e.target.dataset.section;
        checkedSections[sectionKey] = e.target.checked;
        localStorage.setItem(
          "checkedSections",
          JSON.stringify(checkedSections)
        );
        const label = e.target.nextElementSibling;
        if (e.target.checked) {
          label.classList.add("line-through", "text-gray-400");
          label.classList.remove("text-gray-700");
        } else {
          label.classList.remove("line-through", "text-gray-400");
          label.classList.add("text-gray-700");
        }
      }
    });

    // Load default section or from hash
    const hash = window.location.hash.substring(1);
    const defaultSection =
      hash && content[currentLang].sections[hash]
        ? hash
        : Object.keys(content[currentLang].sections)[0];
    updateSectionContent(defaultSection, content);
    const activeLink = document.querySelector(
      `#sections-nav a[href="#${defaultSection}"]`
    );
    if (activeLink) activeLink.classList.add("font-bold", "text-blue-600");
  }

  function updateSectionContent(sectionKey, content) {
    const contentArea = contentElements["content-area"];
    if (!contentArea) return;

    const section = content[currentLang].sections[sectionKey];
    if (section) {
      contentArea.innerHTML = `
            <h2 class="text-3xl font-bold text-gray-900 mb-6">${section.title}</h2>
            <div class="prose max-w-none">
                ${section.content}
            </div>
        `;
      window.location.hash = sectionKey;
    } else {
      contentArea.innerHTML = "<p>Section not found.</p>";
    }
  }

  langToggle.addEventListener("click", () => {
    currentLang = currentLang === "en" ? "fr" : "en";
    localStorage.setItem("lang", currentLang);
    loadContent();
  });

  loadContent();
});
