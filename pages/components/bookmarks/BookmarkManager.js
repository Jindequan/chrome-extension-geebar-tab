export class BookmarkManager {
    constructor() {
        this.bookmarks = [];
        this.folders = new Map();
        this.expandedFolders = new Set(this.loadExpandedState());
        this.mockBookmarks = {
            children: [
                {
                    id: '1',
                    title: '书签栏',
                    children: [
                        {
                            id: '2',
                            title: '常用网站',
                            children: [
                                {
                                    id: '3',
                                    title: 'Google',
                                    url: 'https://www.google.com'
                                },
                                {
                                    id: '4',
                                    title: 'GitHub',
                                    url: 'https://github.com'
                                }
                            ]
                        }
                    ]
                }
            ]
        };
    }

    loadExpandedState() {
        const saved = localStorage.getItem('expandedFolders');
        return saved ? JSON.parse(saved) : ['1', '2'];
    }

    saveExpandedState() {
        const expandedArray = Array.from(this.expandedFolders);
        localStorage.setItem('expandedFolders', JSON.stringify(expandedArray));
    }

    async initialize() {
        await this.loadBookmarks();
    }

    async loadBookmarks() {
        // 在非扩展环境中使用模拟数据
        if (typeof chrome === 'undefined' || !chrome.bookmarks) {
            const rootNode = {
                id: '0',
                children: this.mockBookmarks.children
            };
            this.folders.set('0', rootNode);
            this.mockBookmarks.children.forEach(child => {
                this.processBookmarkTree(child, rootNode);
            });
            return;
        }

        // 在扩展环境中使用真实的书签数据
        const tree = await chrome.bookmarks.getTree();
        const rootNode = {
            id: '0',
            children: tree[0].children
        };
        this.folders.set('0', rootNode);
        tree[0].children.forEach(child => {
            this.processBookmarkTree(child, rootNode);
        });
    }

    processBookmarkTree(node, parentFolder) {
        if (!node.url) {
            const folder = {
                ...node,
                parent: parentFolder,
                children: node.children || []
            };
            this.folders.set(node.id, folder);

            if (node.children) {
                node.children.forEach(child => {
                    this.processBookmarkTree(child, folder);
                });
            }
        } else {
            this.bookmarks.push({
                ...node,
                parent: parentFolder
            });
        }
    }

    renderFolderTree(container) {
        container.innerHTML = '';
        if (!this.folders.size) {
            container.innerHTML = `<div class="no-bookmarks">${i18nManager.t('bookmarks.noBookmarks')}</div>`;
            return;
        }

        const ul = document.createElement('ul');
        ul.className = 'folder-tree';
        
        const rootFolder = this.folders.get('0');
        if (rootFolder && rootFolder.children) {
            rootFolder.children.forEach(child => {
                const folder = this.folders.get(child.id);
                if (folder) {
                    const li = this.createFolderElement(folder);
                    if (this.expandedFolders.has(folder.id)) {
                        li.classList.add('expanded');
                    }
                    ul.appendChild(li);
                }
            });
        }
        
        container.appendChild(ul);
    }

    createFolderElement(folder) {
        const li = document.createElement('li');
        li.className = 'folder';
        li.dataset.folderId = folder.id;
        
        const content = document.createElement('div');
        content.className = 'folder-content';
        
        const title = document.createElement('span');
        title.className = 'folder-title';
        title.textContent = folder.title;
        
        const count = document.createElement('span');
        count.className = 'bookmark-count';
        count.textContent = `(${this.countBookmarks(folder)})`;
        
        content.appendChild(title);
        content.appendChild(count);
        li.appendChild(content);
        
        if (folder.children && folder.children.length > 0) {
            const subUl = document.createElement('ul');
            
            folder.children.forEach(child => {
                if (child.url) {
                    const bookmarkLi = this.createBookmarkElement(child);
                    subUl.appendChild(bookmarkLi);
                } else {
                    const subFolder = this.folders.get(child.id);
                    if (subFolder) {
                        const subFolderLi = this.createFolderElement(subFolder);
                        if (this.expandedFolders.has(subFolder.id)) {
                            subFolderLi.classList.add('expanded');
                        }
                        subUl.appendChild(subFolderLi);
                    }
                }
            });
            
            if (subUl.children.length > 0) {
                li.appendChild(subUl);
            }
        }
        
        // 添加右键菜单
        content.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.showContextMenu(e, folder);
        });
        
        // 添加点击展开/折叠事件
        content.addEventListener('click', (e) => {
            e.stopPropagation();
            li.classList.toggle('expanded');
            
            if (li.classList.contains('expanded')) {
                this.expandedFolders.add(folder.id);
            } else {
                this.expandedFolders.delete(folder.id);
            }
            this.saveExpandedState();
        });
        
        return li;
    }

    createBookmarkElement(bookmark) {
        const li = document.createElement('li');
        li.className = 'bookmark';
        
        const content = document.createElement('div');
        content.className = 'folder-content';
        
        const icon = document.createElement('img');
        icon.className = 'bookmark-icon';
        icon.width = 16;
        icon.height = 16;
        icon.src = this.getFaviconUrl(bookmark.url);
        // 静默处理图标加载错误
        icon.onerror = () => {
            icon.src = this.getDefaultFavicon();
            icon.onerror = null;
        };
        
        const title = document.createElement('span');
        title.className = 'bookmark-title';
        title.textContent = bookmark.title || new URL(bookmark.url).hostname;
        
        content.appendChild(icon);
        content.appendChild(title);
        li.appendChild(content);
        
        li.addEventListener('click', (e) => {
            e.preventDefault();
            window.open(bookmark.url, '_blank');
        });
        
        return li;
    }

    getFaviconUrl(url) {
        if (!url) return this.getDefaultFavicon();
        
        try {
            const urlObj = new URL(url);
            // 使用 Google 的 favicon 服务作为备选
            return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
        } catch (error) {
            console.warn('Invalid URL:', url);
            return this.getDefaultFavicon();
        }
    }

    getDefaultFavicon() {
        return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzk5OSI+PHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgMThjLTQuNDEgMC04LTMuNTktOC04czMuNTktOCA4LTggOCAzLjU5IDggOC0zLjU5IDgtOCA4eiIvPjwvc3ZnPg==';
    }

    searchBookmarks(query) {
        if (!query || typeof query !== 'string') return [];
        
        try {
            query = query.toLowerCase().trim();
            if (query.length === 0) return [];
            
            const results = [];
            const processedNodes = new Set(); // 防止循环引用
            
            const searchInFolder = (node) => {
                if (!node || !node.children || processedNodes.has(node.id)) {
                    return;
                }
                
                processedNodes.add(node.id);
                
                for (const item of node.children) {
                    try {
                        if (item.url) {
                            // 这是一个书签
                            const titleMatch = item.title && item.title.toLowerCase().includes(query);
                            const urlMatch = item.url && item.url.toLowerCase().includes(query);
                            
                            if (titleMatch || urlMatch) {
                                results.push({
                                    id: item.id,
                                    title: item.title || '',
                                    url: item.url,
                                    parentId: item.parentId
                                });
                            }
                        } else if (item.children) {
                            // 这是一个文件夹，递归搜索
                            searchInFolder(item);
                        }
                    } catch (itemError) {
                        console.warn('Error processing bookmark item:', itemError);
                        continue;
                    }
                    
                    // 限制结果数量
                    if (results.length >= 10) {
                        return;
                    }
                }
            };

            // 从根节点开始搜索
            const rootNode = this.folders.get('0');
            if (rootNode) {
                searchInFolder(rootNode);
            }

            return results;
            
        } catch (error) {
            console.error('Error in searchBookmarks:', error);
            return [];
        }
    }

    initializeBookmarkEvents(bookmarkElement, bookmark) {
        // 点击事件 - 直接访问
        bookmarkElement.addEventListener('click', (e) => {
            if (!e.target.closest('.bookmark-actions')) {
                window.open(bookmark.url, '_blank');
            }
        });

        // 拖拽事件
        bookmarkElement.setAttribute('draggable', 'true');
        bookmarkElement.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', JSON.stringify({
                type: 'bookmark',
                title: bookmark.title,
                url: bookmark.url
            }));
            e.dataTransfer.effectAllowed = 'copy';
        });
    }

    renderBookmark(bookmark) {
        const bookmarkElement = document.createElement('div');
        bookmarkElement.className = 'bookmark';
        bookmarkElement.innerHTML = `
            <div class="folder-content">
                <img class="bookmark-icon" src="${this.getFaviconUrl(bookmark.url)}" 
                     width="16" height="16" alt="">
                <span class="bookmark-title">${bookmark.title}</span>
            </div>
        `;
        
        // 静默处理图标加载错误
        const icon = bookmarkElement.querySelector('.bookmark-icon');
        if (icon) {
            icon.onerror = () => {
                icon.src = this.getDefaultFavicon();
                icon.onerror = null;
            };
        }
        
        this.initializeBookmarkEvents(bookmarkElement, bookmark);
        return bookmarkElement;
    }

    countBookmarks(folder) {
        let count = 0;
        
        if (folder.children) {
            folder.children.forEach(child => {
                if (child.url) {
                    count++;
                } else {
                    const subFolder = this.folders.get(child.id);
                    if (subFolder) {
                        count += this.countBookmarks(subFolder);
                    }
                }
            });
        }
        
        return count;
    }
} 