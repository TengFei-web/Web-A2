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
            this.setupRegistrationForm();
            
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

        // 获取事件图片
        const { imageUrl } = this.getEventImageInfo(event);

        container.innerHTML = `
            <div class="event-detail-card">
                <!-- 事件图片 -->
                <div class="event-detail-image">
                    <img src="${imageUrl}" alt="${this.escapeHtml(event.name)}" 
                         onerror="this.src='https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop'">
                    <div class="image-overlay">
                        <span class="event-category">${this.escapeHtml(event.category_name)}</span>
                    </div>
                </div>
                
                <!-- 完整事件信息 -->
                <div class="event-detail-content">
                    <div class="event-main-info">
                        <div class="event-header">
                            <h1 class="event-title">${this.escapeHtml(event.name)}</h1>
                            <div class="event-meta-grid">
                                <div class="meta-item">
                                    <span class="meta-icon">📅</span>
                                    <div class="meta-content">
                                        <strong>Date & Time</strong>
                                        <span>${formattedDateTime}</span>
                                    </div>
                                </div>
                                <div class="meta-item">
                                    <span class="meta-icon">📍</span>
                                    <div class="meta-content">
                                        <strong>Location</strong>
                                        <span>${this.escapeHtml(event.location)}</span>
                                        ${event.address ? `<span class="address">${this.escapeHtml(event.address)}</span>` : ''}
                                    </div>
                                </div>
                                <div class="meta-item">
                                    <span class="meta-icon">🎯</span>
                                    <div class="meta-content">
                                        <strong>Purpose</strong>
                                        <span>${this.getEventPurpose(event)}</span>
                                    </div>
                                </div>
                                ${event.max_attendees ? `
                                <div class="meta-item">
                                    <span class="meta-icon">👥</span>
                                    <div class="meta-content">
                                        <strong>Capacity</strong>
                                        <span>${event.max_attendees} attendees maximum</span>
                                    </div>
                                </div>
                                ` : ''}
                            </div>
                        </div>

                        <!-- 完整描述 -->
                        <section class="description-section">
                            <h2>About This Event</h2>
                            <div class="event-description">
                                <p>${this.escapeHtml(event.full_description || event.short_description || 'Join us for this meaningful charity event that supports our community.')}</p>
                            </div>
                        </section>

                        <!-- 筹款进度 -->
                        ${event.goal_amount > 0 ? `
                        <section class="progress-section">
                            <h2>Fundraising Progress</h2>
                            <div class="progress-card">
                                <div class="progress-stats">
                                    <div class="progress-stat">
                                        <span class="stat-label">Raised</span>
                                        <span class="stat-amount">$${event.current_amount.toLocaleString()}</span>
                                    </div>
                                    <div class="progress-stat">
                                        <span class="stat-label">Goal</span>
                                        <span class="stat-amount">$${event.goal_amount.toLocaleString()}</span>
                                    </div>
                                    <div class="progress-stat">
                                        <span class="stat-label">Progress</span>
                                        <span class="stat-percentage">${progressPercentage.toFixed(1)}%</span>
                                    </div>
                                </div>
                                <div class="progress-bar-large">
                                    <div class="progress-fill-large" style="width: ${progressPercentage}%"></div>
                                </div>
                                <p class="progress-description">Your support helps us reach our goal to make a difference in our community.</p>
                            </div>
                        </section>
                        ` : ''}
                    </div>

                    <!-- 门票信息和注册 -->
                    <div class="event-sidebar">
                        <div class="ticket-card">
                            <h3>Ticket Information</h3>
                            <div class="ticket-price">
                                ${event.ticket_type === 'free' ? 
                                    '<span class="free-badge">FREE</span>' : 
                                    `<span class="price-amount">$${event.ticket_price}</span>`
                                }
                                <span class="price-type">${event.ticket_type === 'free' ? 'Free Entry' : 'Per Person'}</span>
                            </div>
                            
                            <div class="ticket-features">
                                <h4>What's Included:</h4>
                                <ul class="feature-list">
                                    ${this.getTicketFeatures(event)}
                                </ul>
                            </div>

                            <div class="registration-cta">
                                <button class="register-btn-primary" id="register-btn">
                                    <span class="btn-icon">🎫</span>
                                    Register Now
                                </button>
                                <p class="registration-note">Secure your spot for this meaningful event</p>
                            </div>
                        </div>

                        <!-- 快速信息 -->
                        <div class="quick-info-card">
                            <h4>Quick Info</h4>
                            <div class="info-items">
                                <div class="info-item">
                                    <span class="info-icon">⏰</span>
                                    <span class="info-text">Duration: ${this.getEventDuration(event)}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-icon">👕</span>
                                    <span class="info-text">Dress Code: ${this.getDressCode(event)}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-icon">🅿️</span>
                                    <span class="info-text">Parking: Available on site</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-icon">♿</span>
                                    <span class="info-text">Accessibility: Wheelchair accessible</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // 添加注册按钮事件监听
        document.getElementById('register-btn').addEventListener('click', () => this.showRegistrationModal());
    }

    getEventPurpose(event) {
        const purposes = {
            'Fun Run': 'Supporting community health and fitness initiatives',
            'Gala Dinner': 'Raising funds for medical equipment and patient care',
            'Silent Auction': 'Funding art programs and creative therapies',
            'Concert': 'Supporting animal rescue and welfare organizations',
            'Workshop': 'Providing educational opportunities for youth',
            'Sports Tournament': 'Promoting youth sports and development programs',
            'Yoga': 'Supporting mental health awareness and services'
        };
        
        return purposes[event.category_name] || 'Supporting meaningful community causes and charitable initiatives';
    }

    getTicketFeatures(event) {
        const baseFeatures = [
            'Entry to the event',
            'Complimentary refreshments',
            'Event souvenir',
            'Opportunity to network with like-minded individuals'
        ];

        const categoryFeatures = {
            'Fun Run': ['Race bib', 'Finisher medal', 'Hydration stations', 'First aid support'],
            'Gala Dinner': ['Three-course meal', 'Live entertainment', 'Complimentary drinks', 'Auction participation'],
            'Silent Auction': ['Catalog of items', 'Bidding paddle', 'Expert appraisals', 'Refreshments'],
            'Concert': ['Reserved seating', 'Artist meet & greet', 'Concert program', 'Sound quality guarantee'],
            'Workshop': ['All materials provided', 'Expert instruction', 'Take-home resources', 'Certificate of participation'],
            'Sports Tournament': ['Team registration', 'Equipment provided', 'Trophies and prizes', 'Refreshments'],
            'Yoga': ['Yoga mat rental', 'Expert instruction', 'Healthy snacks', 'Wellness goodie bag']
        };

        const features = categoryFeatures[event.category_name] || baseFeatures;
        
        return features.map(feature => `<li>${feature}</li>`).join('');
    }

    getEventDuration(event) {
        const durations = {
            'Fun Run': '3-4 hours',
            'Gala Dinner': '4-5 hours',
            'Silent Auction': '3 hours',
            'Concert': '2-3 hours',
            'Workshop': '2 hours',
            'Sports Tournament': '6-8 hours',
            'Yoga': '1.5 hours'
        };
        
        return durations[event.category_name] || '2-3 hours';
    }

    getDressCode(event) {
        const dressCodes = {
            'Fun Run': 'Athletic wear and running shoes',
            'Gala Dinner': 'Business formal / Evening attire',
            'Silent Auction': 'Smart casual',
            'Concert': 'Casual / Concert attire',
            'Workshop': 'Casual and comfortable',
            'Sports Tournament': 'Sports attire',
            'Yoga': 'Comfortable workout clothes'
        };
        
        return dressCodes[event.category_name] || 'Casual';
    }

    getEventImageInfo(event) {
        const imageMap = {
            1: { // Annual Charity Run 2025
                url: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=800&h=400&fit=crop'
            },
            2: { // Gala Dinner for Children Hospital
                url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=400&fit=crop'
            },
            3: { // Art for Heart Silent Auction
                url: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=800&h=400&fit=crop'
            },
            4: { // Rock for Rescue Concert
                url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=400&fit=crop'
            },
            5: { // Coding for Kids Workshop
                url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop'
            },
            6: { // Charity Basketball Tournament
                url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=400&fit=crop'
            },
            7: { // Winter Gala for Homeless Shelter
                url: 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800&h=400&fit=crop'
            },
            8: { // Sunset Yoga for Mental Health
                url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=400&fit=crop'
            }
        };
        
        return imageMap[event.id] || {
            url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop'
        };
    }

    setupModal() {
        const modal = document.getElementById('register-modal');
        const closeBtn = document.querySelector('.modal-close');
        const closeModalBtn = document.getElementById('close-modal-btn');
        
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

    setupRegistrationForm() {
        const form = document.getElementById('registration-form');
        if (form) {
            form.addEventListener('submit', (event) => this.handleRegistration(event));
        }
    }

    handleRegistration(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const registrationData = {
            fullName: formData.get('full-name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            ticketType: formData.get('ticket-type'),
            quantity: formData.get('quantity'),
            specialRequirements: formData.get('special-requirements'),
            newsletter: formData.get('newsletter') === 'on'
        };

        // 这里可以添加实际的注册逻辑
        console.log('Registration data:', registrationData);
        
        // 显示成功消息
        alert('Thank you for your registration! You will receive a confirmation email shortly.');
        this.hideModal();
        
        // 重置表单
        event.target.reset();
    }

    showRegistrationModal() {
        const modal = document.getElementById('register-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    hideModal() {
        const modal = document.getElementById('register-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    showLoading(message) {
        const container = document.getElementById('event-detail-container');
        container.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>${message}</p>
            </div>
        `;
    }

    showError(message) {
        const container = document.getElementById('event-detail-container');
        container.innerHTML = `
            <div class="error-state">
                <div class="error-icon">❌</div>
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