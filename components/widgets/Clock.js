import i18nManager from '../common/i18n.js';

export class ClockWidget {
    constructor() {
        this.title = i18nManager.t('clock.title');
        this.timer = null;

        // 监听语言变更
        window.addEventListener('languagechange', () => {
            this.title = i18nManager.t('clock.title');
            this.updateClock(); // 立即更新显示
        });
    }

    initialize(container) {
        this.container = container;
        this.render();
        this.startClock();
    }

    render() {
        this.container.innerHTML = `
            <div class="clock-widget">
                <div class="time">00:00:00</div>
                <div class="date"></div>
            </div>
        `;
        this.timeEl = this.container.querySelector('.time');
        this.dateEl = this.container.querySelector('.date');
    }

    updateClock() {
        const now = new Date();
        const time = now.toLocaleTimeString();
        const date = now.toLocaleDateString();
        const weekday = i18nManager.t('clock.weekdays')[now.getDay()];
        
        this.timeEl.textContent = time;
        this.dateEl.textContent = `${date} ${weekday}`;
    }

    startClock() {
        this.updateClock();
        this.timer = setInterval(() => this.updateClock(), 1000);
    }

    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    destroy() {
        this.stop();
    }

    updateContent(container) {
        // 重新渲染时钟内容
        this.container = container;
        this.render();
    }
} 