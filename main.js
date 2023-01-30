(async () => {
  await reiteratePreferenceOnPageLanguage();
})();

// If the current page is written in one of the preferred languages,
// set the page language as the ONLY (and consequently, the FIRST) preferred language.
//
// There are some translation scripts that
// respect only the FIRST preferred language and disregard the others.
// The following function is to prevent them from aggressively attempting to
// translate a less-preferred language into the FIRST preferred language.
async function reiteratePreferenceOnPageLanguage() {
  const pageLanguage = getPageLanguage();
  const preferredLanguages = await getPreferredLanguages();
  if (preferredLanguages.has(pageLanguage)) {
    expressPreferenceOn(pageLanguage);
  }
}

function normaliseLanguage(languageTag) {
  try {
    return new Intl.Locale(languageTag).language;
  } catch (error) {
    return "";
  }
}

function getPageLanguage() {
  return normaliseLanguage(document.documentElement.lang);
}

async function getPreferredLanguages() {
  return new Set(
    (await browser.i18n.getAcceptLanguages())
      .map((x) => normaliseLanguage(x))
      .filter((x) => x !== "")
  );
}

function expressPreferenceOn(language) {
  Object.defineProperty(window.navigator.wrappedJSObject, "languages", {
    // An array object needs to be cloned into the page script's scope
    // to make its properties accessible.
    value: cloneInto([language], window.navigator),
  });
  Object.defineProperty(window.navigator.wrappedJSObject, "language", {
    value: language,
  });
}
