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
                <div class="event-image-placeholder ${this.getCategoryClass(event.category_name)}">
                    <span class="placeholder-icon">🎗️</span>
                    <span class="placeholder-text">${this.escapeHtml(event.category_name)}</span>
                    <span class="event-category ${this.getCategoryClass(event.category_name)}">
                        ${this.escapeHtml(event.category_name)}
                    </span>
                </div>
                <div class="event-content">
                    <h3>${this.escapeHtml(event.name)}</h3>
                    <div class="event-meta">
                        <div class="event-date">
                            <span class="meta-icon">📅</span>
                            ${formattedDate}
                        </div>
                        <div class="event-time">
                            <span class="meta-icon">⏰</span>
                            ${formattedTime}
                        </div>
                        <div class="event-location">
                            <span class="meta-icon">📍</span>
                            ${this.escapeHtml(event.location)}
                        </div>
                    </div>
                    <p class="event-description">
                        ${this.escapeHtml(event.short_description || 'Join us for this wonderful charity event!')}
                    </p>
                    <div class="event-footer">
                        <div class="event-price">
                            ${event.ticket_type === 'free' ? 'FREE ENTRY' : `$${event.ticket_price}`}
                        </div>
                        <button class="view-details-btn" onclick="HomePage.viewEventDetails(${event.id})">
                            View Details & Register
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    getCategoryClass(categoryName) {
        const classMap = {
            'Fun Run': 'run',
            'Gala Dinner': 'gala',
            'Silent Auction': 'auction',
            'Concert': 'concert',
            'Workshop': 'workshop',
            'Sports Tournament': 'sports',
            'Yoga': 'yoga'
        };
        
        return classMap[categoryName] || 'default';
    }

    static viewEventDetails(eventId) {
        localStorage.setItem('selectedEventId', eventId);
        window.location.href = 'event-details.html';
    }

    showLoading(message) {
        const container = document.getElementById('events-container');
        container.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>${message}</p>
            </div>
        `;
    }

    showError(message) {
        const container = document.getElementById('events-container');
        container.innerHTML = `
            <div class="error-state">
                <div class="error-icon">❌</div>
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