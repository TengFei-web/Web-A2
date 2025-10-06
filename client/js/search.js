// 搜索页面功能 - 使用新的RESTful API
class SearchPage {
    constructor() {
        this.categories = [];
        this.currentResults = [];
        this.init();
    }

    async init() {
        try {
            await this.loadCategories();
            this.setupEventListeners();
            this.loadSearchSuggestions();
        } catch (error) {
            console.error('Search page initialization failed:', error);
            this.showError('Failed to initialize search page.');
        }
    }

    async loadCategories() {
        try {
            const response = await fetch('/api/categories');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Failed to load categories');
            }
            
            this.categories = result.data;
            this.populateCategoryDropdown();
            
        } catch (error) {
            console.error('Error loading categories:', error);
            this.showError('Failed to load categories.');
        }
    }

    populateCategoryDropdown() {
        const categorySelect = document.getElementById('category');
        categorySelect.innerHTML = '<option value="">All Categories</option>';
        
        this.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.id;
            option.textContent = category.name;
            categorySelect.appendChild(option);
        });
    }

    async loadSearchSuggestions() {
        try {
            const response = await fetch('/api/events/search/suggestions');
            
            if (response.ok) {
                const result = await response.json();
                if (result.success) {
                    this.setupLocationAutocomplete(result.data.locations);
                }
            }
        } catch (error) {
            console.error('Error loading search suggestions:', error);
        }
    }

    setupLocationAutocomplete(locations) {
        const locationInput = document.getElementById('location');
        const datalist = document.createElement('datalist');
        datalist.id = 'location-suggestions';
        
        locations.forEach(location => {
            const option = document.createElement('option');
            option.value = location;
            datalist.appendChild(option);
        });
        
        document.body.appendChild(datalist);
        locationInput.setAttribute('list', 'location-suggestions');
    }

    setupEventListeners() {
        const searchForm = document.getElementById('search-form');
        const clearBtn = document.getElementById('clear-btn');
        
        searchForm.addEventListener('submit', (event) => this.handleSearch(event));
        clearBtn.addEventListener('click', () => this.clearFilters());
        
        // 实时搜索（可选功能）
        const locationInput = document.getElementById('location');
        locationInput.addEventListener('input', () => this.debouncedSearch());
    }

    async handleSearch(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const searchCriteria = {
            category: formData.get('category'),
            location: formData.get('location'),
            date: formData.get('date'),
            active: 'true' // 只搜索活跃活动
        };
        
        await this.searchEvents(searchCriteria);
    }

    async searchEvents(criteria) {
        try {
            this.showLoading('Searching for events...');
            
            // 构建查询参数
            const params = new URLSearchParams();
            if (criteria.category) params.append('category', criteria.category);
            if (criteria.location) params.append('location', criteria.location);
            if (criteria.date) params.append('date', criteria.date);
            if (criteria.active) params.append('active', criteria.active);
            
            const response = await fetch(`/api/events?${params.toString()}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.error || 'Search failed');
            }
            
            this.currentResults = result.data;
            this.displaySearchResults(result.data);
            
        } catch (error) {
            console.error('Error searching events:', error);
            this.showError(`Search failed: ${error.message}`);
        }
    }

    displaySearchResults(events) {
        const container = document.getElementById('search-results');
        
        if (!events || events.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <h3>No Events Found</h3>
                    <p>Try adjusting your search criteria or browse all events on the home page.</p>
                    <button onclick="window.location.href='index.html'" class="btn btn-primary">
                        View All Events
                    </button>
                </div>
            `;
            return;
        }
        
        container.innerHTML = events.map(event => this.createEventCard(event)).join('');
    }

    createEventCard(event) {
        const eventDate = new Date(event.date_time);
        const formattedDate = eventDate.toLocaleDateString('en-AU', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });

        return `
            <div class="event-card" data-event-id="${event.id}">
                <span class="event-category">${this.escapeHtml(event.category_name)}</span>
                <h4>${this.escapeHtml(event.name)}</h4>
                <div class="event-details">
                    <p class="event-date">📅 ${formattedDate}</p>
                    <p class="event-location">📍 ${this.escapeHtml(event.location)}</p>
                    <p class="event-description">${this.escapeHtml(event.short_description || 'Join us for this charity event!')}</p>
                </div>
                <div class="event-footer">
                    <div class="event-price">
                        ${event.ticket_type === 'free' ? 'FREE' : `$${event.ticket_price}`}
                    </div>
                    <button class="view-details-btn" onclick="SearchPage.viewEventDetails(${event.id})">
                        View Details
                    </button>
                </div>
            </div>
        `;
    }

    static viewEventDetails(eventId) {
        localStorage.setItem('selectedEventId', eventId);
        window.location.href = 'event-details.html';
    }

    clearFilters() {
        document.getElementById('search-form').reset();
        document.getElementById('search-results').innerHTML = 
            '<div class="loading">Use the form above to search for events</div>';
        this.currentResults = [];
    }

    showLoading(message) {
        const container = document.getElementById('search-results');
        container.innerHTML = `<div class="loading">${message}</div>`;
    }

    showError(message) {
        const container = document.getElementById('search-results');
        container.innerHTML = `
            <div class="error">
                <h3>Search Error</h3>
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

    // 防抖函数用于实时搜索
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    debouncedSearch = this.debounce(() => {
        const formData = new FormData(document.getElementById('search-form'));
        const criteria = {
            category: formData.get('category'),
            location: formData.get('location'),
            date: formData.get('date'),
            active: 'true'
        };
        this.searchEvents(criteria);
    }, 500);
}

// 初始化搜索页面
document.addEventListener('DOMContentLoaded', function() {
    window.searchPage = new SearchPage();
});