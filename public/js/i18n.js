const APP_LANGUAGE = "ar";

let dictionary = {};
let currentLanguage = APP_LANGUAGE;

export function t(key, fallback = key) {
  return dictionary[key] || fallback;
}

export function getLanguage() {
  return APP_LANGUAGE;
}

export async function loadLanguage() {
  try {
    const response = await fetch(`./languages/${APP_LANGUAGE}.json`);
    dictionary = await response.json();
    currentLanguage = APP_LANGUAGE;
  } catch {
    currentLanguage = APP_LANGUAGE;
  }

  localStorage.removeItem("alraqi-language");
  document.documentElement.lang = currentLanguage;
  document.documentElement.dir = "rtl";
  applyTranslations();
  return currentLanguage;
}

export function applyTranslations(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n, element.textContent);
  });

  root.querySelectorAll("[data-i18n-placeholder]").forEach((element) => {
    element.setAttribute("placeholder", t(element.dataset.i18nPlaceholder, element.getAttribute("placeholder") || ""));
  });
}
