function currentTabDomain() {
  return browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    let tabInfo = tabs[0];
    var currentDomain = new URL(tabInfo.url).hostname;
    return currentDomain;
  });
}

function similarTabs(domain, matchType) {
  // TODO: handle matchType=subdomain
  return browser.tabs.query({ url: `*://${domain}/*` });
}

function setPopupDomainText(domain, section, matchType) {
  let domainElt = document.getElementById(`${section}-domain`);
  let matchingElt = document.getElementById(`${section}-domain-matching-count`);
  if (domain) {
    similarTabs(domain, matchType).then((tabs) => {
      let count = tabs.length;
      domainElt.innerText = domain;
      matchingElt.innerText = count;
    });
  }
}

async function setPopupCurrentDomain() {
  let domain = await currentTabDomain();
  setPopupDomainText(domain, 'current', 'full');
}

function setPopupCustomDomain() {
  let domain = document.getElementById('custom-domain').value.trim();
  setPopupDomainText(domain, 'custom', 'full');
}

function closeTabs(domain, matchType) {
  similarTabs(domain, matchType).then((tabs) => {
    for (let tab of tabs) {
      if (tab.active || tab.highlighted) {
        continue;
      }
      browser.tabs.remove(tab.id);
    }
  })
}

// Reads the currently selected domain source ("current" tab or "custom"
// entry) and match type, then closes matching tabs accordingly.
function closeTabsFromUI() {
  let matchType = document.getElementById('match-type-subdomain').checked ? "subdomain" : "full";
  let useCustom = document.getElementById('domain-source-custom').checked;

  if (useCustom) {
    let domain = document.getElementById('custom-domain').value.trim();
    if (domain) {
      closeTabs(domain, matchType);
    }
    return;
  }

  currentTabDomain().then((current) => {
    closeTabs(current, matchType);
  });
}

function getCurrentWindowTabs() {
  return browser.tabs.query({currentWindow: true});
}

document.addEventListener("DOMContentLoaded", showUI);

async function showUI() {
  await setPopupCurrentDomain();
  setPopupCustomDomain();
}

document.addEventListener("input", (e) => {
  if (e.target.id === "custom-domain") {
    setPopupCustomDomain();
  }
});

document.addEventListener("click", (e) => {
  if (e.target.id === "custom-domain") {
    document.getElementById('domain-source-custom').checked = true;
  }

  function callOnActiveTab(callback) {
    getCurrentWindowTabs().then((tabs) => {
      for (let tab of tabs) {
        if (tab.active) {
          callback(tab, tabs);
        }
      }
    });
  }

  if (e.target.id === "tabs-close") {
    closeTabsFromUI();
    showUI();
  }
});
