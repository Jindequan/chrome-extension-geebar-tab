import i18nManager from '../common/i18n.js';

export class WeatherWidget {
    constructor() {
        this.title = i18nManager.t('widgets.weather.title');
        this.apiKey = '3650d1e453bab4d5cc52b90eae455cc7';
        this.updateInterval = 1800000; // 30分钟更新一次
        this.timer = null;
        this.location = this.loadSavedLocation();
    }

    loadSavedLocation() {
        const saved = localStorage.getItem('weatherLocation');
        return saved ? JSON.parse(saved) : {
            lat: 31.2304,  // 默认上海
            lon: 121.4737,
            city: '上海'
        };
    }

    saveLocation(location) {
        localStorage.setItem('weatherLocation', JSON.stringify(location));
        this.location = location;
    }

    initialize(container) {
        this.container = container;
        this.render();
        this.loadWeatherData();
        this.startAutoUpdate();
    }

    render() {
        this.container.innerHTML = `
            <div class="weather-widget">
                <div class="weather-loading">${i18nManager.t('widgets.weather.loading')}</div>
                
                <div class="weather-content" style="display: none;">
                    <div class="weather-main">
                        <div class="weather-left">
                            <div class="weather-temp">
                                <span class="temp"></span>
                                <span class="unit">°C</span>
                            </div>
                            <div class="weather-info">
                                <div class="description"></div>
                                <div class="feels-like">${i18nManager.t('widgets.weather.feelsLike')}: <span></span>°C</div>
                            </div>
                        </div>
                        <div class="weather-right">
                            <div class="location">
                                <span class="city"></span>
                                <button class="change-location" title="${i18nManager.t('widgets.weather.changeLocation')}">📍</button>
                            </div>
                            <div class="details">
                                <div class="detail">
                                    <span class="label">${i18nManager.t('widgets.weather.humidity')}</span>
                                    <span class="humidity"></span>
                                </div>
                                <div class="detail">
                                    <span class="label">${i18nManager.t('widgets.weather.wind')}</span>
                                    <span class="wind"></span>
                                </div>
                                <div class="detail">
                                    <span class="label">${i18nManager.t('widgets.weather.pressure')}</span>
                                    <span class="pressure"></span>
                                </div>
                                <div class="detail">
                                    <span class="label">${i18nManager.t('widgets.weather.visibility')}</span>
                                    <span class="visibility"></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="weather-error" style="display: none;">
                    <div class="error-message">${i18nManager.t('widgets.weather.error')}</div>
                    <button class="retry-button">${i18nManager.t('widgets.weather.retry')}</button>
                </div>
            </div>
        `;

        this.loadingEl = this.container.querySelector('.weather-loading');
        this.contentEl = this.container.querySelector('.weather-content');
        this.errorEl = this.container.querySelector('.weather-error');

        // 添加事件监听
        this.container.querySelector('.change-location').addEventListener('click', () => {
            this.showLocationDialog();
        });

        this.container.querySelector('.retry-button').addEventListener('click', () => {
            this.loadWeatherData();
        });
    }

    async loadWeatherData() {
        try {
            this.showLoading();
            const data = await this.fetchWeatherData();
            this.updateWeatherDisplay(data);
            this.showContent();
        } catch (error) {
            console.error('Failed to load weather data:', error);
            this.showError();
        }
    }

    async fetchWeatherData() {
        const { lat, lon } = this.location;
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${this.apiKey}&units=metric&lang=${i18nManager.currentLang}`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Weather API request failed');
        }
        return await response.json();
    }

    updateWeatherDisplay(data) {
        const content = this.container.querySelector('.weather-content');
        
        // 更新主要信息
        content.querySelector('.temp').textContent = Math.round(data.main.temp);
        content.querySelector('.city').textContent = this.location.city;
        content.querySelector('.description').textContent = data.weather[0].description;
        content.querySelector('.feels-like span').textContent = Math.round(data.main.feels_like);

        // 更新详细信息
        content.querySelector('.humidity').textContent = `${data.main.humidity}%`;
        content.querySelector('.wind').textContent = `${Math.round(data.wind.speed)} m/s`;
        content.querySelector('.pressure').textContent = `${data.main.pressure} hPa`;
        content.querySelector('.visibility').textContent = 
            `${(data.visibility / 1000).toFixed(1)} km`;
            
        // 显示内容
        content.style.display = 'block';
    }

    getWeatherIcon(iconCode) {
        const iconMap = {
            '01d': '☀️',
            '01n': '🌙',
            '02d': '⛅',
            '02n': '☁️',
            '03d': '☁️',
            '03n': '☁️',
            '04d': '☁️',
            '04n': '☁️',
            '09d': '🌧️',
            '09n': '🌧️',
            '10d': '🌦️',
            '10n': '🌧️',
            '11d': '⛈️',
            '11n': '⛈️',
            '13d': '🌨️',
            '13n': '🌨️',
            '50d': '🌫️',
            '50n': '🌫️'
        };
        return iconMap[iconCode] || '🌡️';
    }

    showLocationDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'weather-dialog';
        dialog.innerHTML = `
            <div class="dialog-content">
                <h4>${i18nManager.t('widgets.weather.changeLocation')}</h4>
                <div class="location-search">
                    <input type="text" placeholder="${i18nManager.t('widgets.weather.searchPlaceholder')}" />
                    <div class="search-results"></div>
                </div>
                <div class="dialog-buttons">
                    <button class="cancel">${i18nManager.t('dialog.cancel')}</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        const input = dialog.querySelector('input');
        const results = dialog.querySelector('.search-results');
        const cancel = dialog.querySelector('.cancel');

        let searchTimeout;
        input.addEventListener('input', () => {
            clearTimeout(searchTimeout);
            const query = input.value.trim();
            
            if (query.length >= 2) {
                searchTimeout = setTimeout(() => {
                    this.searchLocation(query).then(locations => {
                        results.innerHTML = locations.map(loc => `
                            <div class="location-item" data-lat="${loc.lat}" data-lon="${loc.lon}">
                                ${loc.name}, ${loc.country}
                            </div>
                        `).join('');
                    });
                }, 500);
            } else {
                results.innerHTML = '';
            }
        });

        results.addEventListener('click', async (e) => {
            const item = e.target.closest('.location-item');
            if (item) {
                const lat = parseFloat(item.dataset.lat);
                const lon = parseFloat(item.dataset.lon);
                const city = item.textContent.split(',')[0];
                
                this.saveLocation({ lat, lon, city });
                await this.loadWeatherData();
                dialog.remove();
            }
        });

        cancel.addEventListener('click', () => {
            dialog.remove();
        });

        input.focus();
    }

    async searchLocation(query) {
        const url = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=5&appid=${this.apiKey}`;
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Location search failed');
        }
        return await response.json();
    }

    showLoading() {
        if (this.loadingEl) this.loadingEl.style.display = 'block';
        if (this.contentEl) this.contentEl.style.display = 'none';
        if (this.errorEl) this.errorEl.style.display = 'none';
    }

    showContent() {
        if (this.loadingEl) this.loadingEl.style.display = 'none';
        if (this.contentEl) this.contentEl.style.display = 'block';
        if (this.errorEl) this.errorEl.style.display = 'none';
    }

    showError() {
        if (this.loadingEl) this.loadingEl.style.display = 'none';
        if (this.contentEl) this.contentEl.style.display = 'none';
        if (this.errorEl) this.errorEl.style.display = 'block';
    }

    startAutoUpdate() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        this.timer = setInterval(() => {
            this.loadWeatherData();
        }, this.updateInterval);
    }

    destroy() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }

    updateContent(container) {
        this.container = container;
        this.render();
        this.loadWeatherData();
    }
} 