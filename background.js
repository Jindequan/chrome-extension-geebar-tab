// 监听快捷键命令
chrome.commands.onCommand.addListener((command) => {
  if (command === "_execute_action") {
    chrome.tabs.create({ url: "pages/newtab.html" });
  }
});

// 监听安装事件
chrome.runtime.onInstalled.addListener(() => {
  console.log('Tab Navigator 已安装');
});

// 监听标签页创建
chrome.tabs.onCreated.addListener(async (tab) => {
    try {
        // 检查是否是新标签页
        if (tab.pendingUrl === 'chrome://newtab/' || tab.url === 'chrome://newtab/') {
            // 检查是否启用了 Geebar Tab
            const result = await chrome.storage.local.get('geebar_enabled');
            if (result.geebar_enabled) {
                // 重定向到 Geebar Tab
                chrome.tabs.update(tab.id, {
                    url: chrome.runtime.getURL('pages/index.html')
                });
            }
        }
    } catch (error) {
        console.error('Error handling new tab:', error);
    }
}); 