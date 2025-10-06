// 活动详情页面功能 - 使用新的RESTful API
class EventDetailsPage {
    constructor() {
        this.eventId = null;
        this.eventData = null;
        this.init();
    }

    async init() {
        try {
            this.eventId = this.getEventIdFromStorage();
            
            if (!this.eventId) {
                this.showError('No event selected. Please select an event from the home or search page.');
                return;
            }
            
            await this.loadEventDetails();
            this.setupModal();
            
        } catch (error) {
            console.error('Event details page initialization failed:', error);
            this.showError('Failed to initialize event details page.');
        }
    }

    getEventIdFromStorage() {
        return localStorage.getItem('selectedEventId');
    }

    async loadEventDetails() {
        try {
            this.showLoading('Loading event details...');
            
            const response = await fetch(`/api/events/${this.eventId}`);
            
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Event not found. It may have been removed or is no longer available.');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to load event details');
            }
            
            this.eventData = result.data;
            this.displayEventDetails(result.data);
            
        } catch (error) {
            console.error('Error loading event details:', error);
            this.showError(`Failed to load event details: ${error.message}`);
        }
    }

    displayEventDetails(event) {
        const container = document.getElementById('event-detail-container');
        
        const progressPercentage = event.goal_amount > 0 ? 
            Math.min(100, (event.current_amount / event.goal_amount) * 100) : 0;
        
        const eventDate = new Date(event.date_time);
        const formattedDateTime = eventDate.toLocaleDateString('en-AU', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        container.innerHTML = `
            <div class="event-detail-card">
                <div class="event-header">
                    <span class="event-category">${this.escapeHtml(event.category_name)}</span>
                    <h1 class="event-title">${this.escapeHtml(event.name)}</h1>
                    <div class="event-meta">
                        <div class="meta-item">📅 ${formattedDateTime}</div>
                        <div class="meta-item">📍 ${this.escapeHtml(event.location)}</div>
                        <div class="meta-item">💰 ${event.ticket_type === 'free' ? 'Free Entry' : `$${event.ticket_price}`}</div>
                    </div>
                </div>
                
                <div class="event-content">
                    <section class="event-description">
                        <h3>About This Event</h3>
                        <p>${this.escapeHtml(event.full_description || event.short_description || 'No description available for this event.')}</p>
                    </section>
                    
                    ${event.address ? `
                        <section class="venue-details">
                            <h3>Venue Details</h3>
                            <p>${this.escapeHtml(event.address)}</p>
                        </section>
                    ` : ''}
                    
                    ${event.max_attendees ? `
                        <section class="event-capacity">
                            <h3>Event Capacity</h3>
                            <p>Maximum attendees: ${event.max_attendees}</p>
                        </section>
                    ` : ''}
                </div>
                
                ${event.goal_amount > 0 ? `
                    <section class="progress-section">
                        <h3>Fundraising Progress</h3>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progressPercentage}%"></div>
                        </div>
                        <div class="progress-text">
                            <span>Raised: $${event.current_amount.toLocaleString()}</span>
                            <span>Goal: $${event.goal_amount.toLocaleString()}</span>
                        </div>
                        <p class="progress-percentage">Progress: ${progressPercentage.toFixed(1)}%</p>
                    </section>
                ` : ''}
                
                <div class="action-section">
                    <button class="register-btn" id="register-btn">
                        Register for This Event
                    </button>
                    <button class="back-btn" onclick="window.history.back()">
                        ← Back to Events
                    </button>
                </div>
            </div>
        `;
        
        // 添加注册按钮事件监听
        document.getElementById('register-btn').addEventListener('click', () => this.showRegistrationModal());
    }

    setupModal() {
        const modal = document.getElementById('register-modal');
        const closeModal = document.querySelector('.close-modal');
        const closeBtn = document.getElementById('close-modal-btn');
        
        if (closeModal) {
            closeModal.addEventListener('click', () => this.hideModal());
        }
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.hideModal());
        }
        
        // 点击模态框外部关闭
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                this.hideModal();
            }
        });
    }

    showRegistrationModal() {
        const modal = document.getElementById('register-modal');
        if (modal) {
            modal.style.display = 'block';
        } else {
            alert('This feature is currently under construction.');
        }
    }

    hideModal() {
        const modal = document.getElementById('register-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    showLoading(message) {
        const container = document.getElementById('event-detail-container');
        container.innerHTML = `<div class="loading">${message}</div>`;
    }

    showError(message) {
        const container = document.getElementById('event-detail-container');
        container.innerHTML = `
            <div class="error">
                <h3>Unable to Load Event</h3>
                <p>${message}</p>
                <div class="error-actions">
                    <button onclick="window.history.back()" class="btn btn-secondary">Go Back</button>
                    <button onclick="window.location.href='index.html'" class="btn btn-primary">Home Page</button>
                </div>
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

// 初始化详情页面
document.addEventListener('DOMContentLoaded', function() {
    window.eventDetailsPage = new EventDetailsPage();
});