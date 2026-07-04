function setSidebarStyle(theme) {
  let root = document.documentElement;

  if (theme.colors) {
    if (theme.colors.popup) root.style.setProperty('--popup', theme.colors.popup);
    if (theme.colors.popup_text) root.style.setProperty('--popup_text', theme.colors.popup_text);
    if (theme.colors.toolbar) root.style.setProperty('--toolbar', theme.colors.toolbar);
    if (theme.colors.toolbar_text) root.style.setProperty('--toolbar_text', theme.colors.toolbar_text);
  } else {
    root.style.setProperty('--popup', 'Canvas');
    root.style.setProperty('--popup_text', 'CanvasText');
  }
}

// Set the element style when the extension page loads
async function setInitialStyle() {
  const theme = await browser.theme.getCurrent();
  setSidebarStyle(theme);
}
setInitialStyle();

// Watch for theme updates
browser.theme.onUpdated.addListener(async ({ theme, windowId }) => {
  const sidebarWindow = await browser.windows.getCurrent();
  /*
    Only update theme if it applies to the window the sidebar is in.
    If a windowId is passed during an update, it means that the theme is applied to that specific window.
    Otherwise, the theme is applied globally to all windows.
  */
  if (!windowId || windowId == sidebarWindow.id) {
    setSidebarStyle(theme);
  }
});
