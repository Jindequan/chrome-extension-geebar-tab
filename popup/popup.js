document.addEventListener('DOMContentLoaded', () => {
    // 打开新标签页
    document.getElementById('newTab').addEventListener('click', () => {
        chrome.tabs.create({ url: 'pages/newtab.html' });
        window.close();
    });

    // 打开设置页面
    document.getElementById('settings').addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
        window.close();
    });
}); 