// 主页功能 - 使用新的RESTful API
class HomePage {
    constructor() {
        this.init();
    }

    async init() {
        try {
            await this.loadActiveEvents();
        } catch (error) {
            console.error('Home page initialization failed:', error);
            this.showError('Failed to initialize page. Please refresh and try again.');
        }
    }

    async loadActiveEvents() {
        try {
            this.showLoading('Loading upcoming charity events...');
            
            const response = await fetch('/api/events/active');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to load events');
            }
            
            this.displayEvents(result.data);
            
        } catch (error) {
            console.error('Error loading events:', error);
            this.showError(`Failed to load events: ${error.message}`);
        }
    }

    displayEvents(events) {
        const container = document.getElementById('events-container');
        
        if (!events || events.length === 0) {
            container.innerHTML = `
                <div class="no-events">
                    <h3>No Upcoming Events</h3>
                    <p>Check back later for new charity events!</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = events.map(event => this.createEventCard(event)).join('');
    }

    createEventCard(event) {
        const eventDate = new Date(event.date_time);
        const formattedDate = eventDate.toLocaleDateString('en-AU', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        const formattedTime = eventDate.toLocaleTimeString('en-AU', {
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="event-card" data-event-id="${event.id}">
                <span class="event-category">${this.escapeHtml(event.category_name)}</span>
                <h4>${this.escapeHtml(event.name)}</h4>
                <div class="event-details">
                    <p class="event-date">📅 ${formattedDate}</p>
                    <p class="event-time">⏰ ${formattedTime}</p>
                    <p class="event-location">📍 ${this.escapeHtml(event.location)}</p>
                    <p class="event-description">${this.escapeHtml(event.short_description || 'Join us for this wonderful charity event!')}</p>
                </div>
                <div class="event-footer">
                    <div class="event-price">
                        ${event.ticket_type === 'free' ? 'FREE ENTRY' : `$${event.ticket_price}`}
                    </div>
                    <button class="view-details-btn" onclick="HomePage.viewEventDetails(${event.id})">
                        View Details & Register
                    </button>
                </div>
            </div>
        `;
    }

    static viewEventDetails(eventId) {
        localStorage.setItem('selectedEventId', eventId);
        window.location.href = 'event-details.html';
    }

    showLoading(message) {
        const container = document.getElementById('events-container');
        container.innerHTML = `<div class="loading">${message}</div>`;
    }

    showError(message) {
        const container = document.getElementById('events-container');
        container.innerHTML = `
            <div class="error">
                <h3>Oops! Something went wrong</h3>
                <p>${message}</p>
                <button onclick="window.location.reload()" class="btn btn-primary">Try Again</button>
            </div>
        `;
    }

    escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}

// 初始化主页
document.addEventListener('DOMContentLoaded', function() {
    window.homePage = new HomePage();
});