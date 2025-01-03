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