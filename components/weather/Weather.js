updateContent(container) {
    if (this.loading) {
        container.innerHTML = `
            <div class="weather-loading">
                ${i18nManager.t('widgets.weather.loading')}
            </div>
        `;
        return;
    }

    if (this.error) {
        container.innerHTML = `
            <div class="weather-error">
                <div>${i18nManager.t('widgets.weather.error')}</div>
                <button class="retry-button">${i18nManager.t('widgets.weather.retry')}</button>
            </div>
        `;
        container.querySelector('.retry-button').addEventListener('click', () => this.loadWeatherData());
        return;
    }

    if (!this.weatherData) return;

    const data = this.weatherData;
    container.innerHTML = `
        <div class="weather-content">
            <div class="weather-header">
                <div class="weather-location">
                    <span>${data.location}</span>
                    <button class="change-location" title="${i18nManager.t('widgets.weather.changeLocation')}">📍</button>
                </div>
                <div class="weather-main">
                    <div class="weather-temp">${Math.round(data.temp)}°C</div>
                    <div class="weather-desc">${data.description}</div>
                </div>
            </div>
            <div class="weather-details">
                <div class="weather-detail">
                    <span class="label">${i18nManager.t('widgets.weather.humidity')}</span>
                    <span class="value">${data.humidity}%</span>
                </div>
                <div class="weather-detail">
                    <span class="label">${i18nManager.t('widgets.weather.wind')}</span>
                    <span class="value">${data.windSpeed} m/s</span>
                </div>
                <div class="weather-detail">
                    <span class="label">${i18nManager.t('widgets.weather.pressure')}</span>
                    <span class="value">${data.pressure} hPa</span>
                </div>
                <div class="weather-detail">
                    <span class="label">${i18nManager.t('widgets.weather.visibility')}</span>
                    <span class="value">${(data.visibility / 1000).toFixed(1)} km</span>
                </div>
                <div class="weather-detail">
                    <span class="label">${i18nManager.t('widgets.weather.feelsLike')}</span>
                    <span class="value">${Math.round(data.feelsLike)}°C</span>
                </div>
            </div>
        </div>
    `;
} 