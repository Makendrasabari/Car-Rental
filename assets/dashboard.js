/**
 * Stackly Travel & Fleet Management Dashboard - Core JS Logic
 * Orchestrates role views, page switching, mock data, ApexCharts, Leaflet maps, and user interactions.
 */

// Shared Mock Data
const mockBookings = [
    { id: 'TX-4029', type: 'flight', title: 'Delta DL-829 (Del-Mum)', date: '2026-06-20', details: 'Departure 08:30 | Terminal 2', cost: 18500, status: 'confirmed' },
    { id: 'TX-4030', type: 'hotel', title: 'The Oberoi - Deluxe Suite', date: '2026-06-20 to 2026-06-25', details: 'Check-in 14:00 | King Bed', cost: 48000, status: 'confirmed' },
    { id: 'TX-4031', type: 'car', title: 'Porsche Taycan EV', date: '2026-06-20 to 2026-06-24', details: 'Chauffeur Included | Salem St.', cost: 85000, status: 'confirmed' },
    { id: 'TX-3991', type: 'flight', title: 'Air India AI-102 (Bgl-Del)', date: '2026-05-14', details: 'Completed', cost: 12000, status: 'completed' },
    { id: 'TX-3992', type: 'hotel', title: 'Taj Palace - Standard Club Room', date: '2026-05-14 to 2026-05-18', details: 'Completed', cost: 32000, status: 'completed' },
    { id: 'TX-3952', type: 'car', title: 'BMW M4 Competition', date: '2026-04-02', details: 'Cancelled by fleet policy', cost: 25000, status: 'cancelled' }
];

const mockVehicles = [
    { reg: 'DL-1CA-5601', name: 'Porsche Taycan EV', category: 'Luxury Sedan', driver: 'Vikram Singh', status: 'active', mileage: '94% Efficiency', cost: 12400 },
    { reg: 'MH-02CE-2900', name: 'Rolls-Royce Phantom', category: 'VIP Luxury', driver: 'Devendra Gowda', status: 'active', mileage: '82% Efficiency', cost: 28500 },
    { reg: 'TN-30AB-1002', name: 'Audi e-tron GT', category: 'EV Sport', driver: 'Unassigned', status: 'idle', mileage: '96% Efficiency', cost: 8900 },
    { reg: 'KA-51MJ-4040', name: 'Range Rover Autobiography', category: 'Premium SUV', driver: 'Rahul Dev (Self)', status: 'active', mileage: '78% Efficiency', cost: 19800 },
    { reg: 'DL-3C-0912', name: 'Aston Martin DBX', category: 'Premium SUV', driver: 'Amit Sen', status: 'maintenance', mileage: 'In Shop (Brakes)', cost: 15400 },
    { reg: 'MH-12RT-8888', name: 'Mercedes Maybach S-Class', category: 'VIP Luxury', driver: 'Sanjay Kumar', status: 'active', mileage: '88% Efficiency', cost: 32000 }
];

const mockDrivers = [
    { id: 'DR-001', name: 'Vikram Singh', license: 'DL-9302183', status: 'assigned', score: '4.9/5.0' },
    { id: 'DR-002', name: 'Devendra Gowda', license: 'KA-4920102', status: 'assigned', score: '4.8/5.0' },
    { id: 'DR-003', name: 'Sanjay Kumar', license: 'MH-1238491', status: 'assigned', score: '4.7/5.0' },
    { id: 'DR-004', name: 'Arun Varma', license: 'TN-3029481', status: 'available', score: '4.9/5.0' },
    { id: 'DR-005', name: 'Manish Rawat', license: 'DL-4928103', status: 'available', score: '4.6/5.0' }
];

// Document Initialization
document.addEventListener('DOMContentLoaded', () => {
    initSharedUserBadge();
    initViewRouter();
    initRoleSwitcher();
    initMobileDrawer();

    // Determine role and trigger initial layouts
    const currentPath = window.location.pathname;
    if (currentPath.includes('traveler-dashboard.html')) {
        initTravelerDashboard();
    } else if (currentPath.includes('fleet-manager-dashboard.html')) {
        initFleetManagerDashboard();
    }
});

// Init User Initials and Text
function initSharedUserBadge() {
    const defaultName = sessionStorage.getItem('userRole') === 'fleet-manager' ? 'Amit Sen' : 'Rahul Dev';
    const name = sessionStorage.getItem('userName') || defaultName;
    const initialElement = document.getElementById('avatar-initials');
    const nameElement = document.getElementById('badge-user-name');
    const headNameElement = document.getElementById('header-user-name');

    if (nameElement) nameElement.textContent = name;
    if (headNameElement) {
        headNameElement.textContent = name.split(' ')[0];
    }
    if (initialElement) {
        const initials = name.split(' ').map(n => n[0]).join('');
        initialElement.textContent = initials.toUpperCase();
        
        const welcomeAvatar = document.querySelector('.welcome-avatar-wrap');
        if (welcomeAvatar) {
            welcomeAvatar.textContent = initials.toUpperCase();
        }
    }
}

// Sidebar Navigation Router
function initViewRouter() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.dashboard-section');

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            const targetId = link.getAttribute('data-target');
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            sections.forEach(sec => {
                sec.classList.remove('active-view');
                if (sec.id === targetId) {
                    sec.classList.add('active-view');
                }
            });

            // Trigger Map updates if maps are in the active tab (leaflet needs invalidateSize)
            setTimeout(() => {
                if (window.travelerMap) window.travelerMap.invalidateSize();
                if (window.fleetMap) window.fleetMap.invalidateSize();
            }, 100);

            // Collapse Mobile Sidebar drawer
            const sidebar = document.getElementById('dashboard-sidebar');
            if (sidebar) sidebar.classList.remove('drawer-open');
        });
    });
}

// Role Switcher Setup
function initRoleSwitcher() {
    const roleBtns = document.querySelectorAll('.role-toggle-btn');
    roleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetRole = btn.getAttribute('data-role');
            sessionStorage.setItem('userRole', targetRole);
            
            if (targetRole === 'traveler') {
                window.location.href = 'traveler-dashboard.html';
            } else {
                window.location.href = 'fleet-manager-dashboard.html';
            }
        });
    });
}

// Mobile Sidebar Drawer Toggle
function initMobileDrawer() {
    const toggleBtn = document.getElementById('mobile-drawer-toggle');
    const sidebar = document.getElementById('dashboard-sidebar');
    const closeBtn = document.getElementById('sidebar-close-btn');

    if (toggleBtn && sidebar) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('drawer-open');
        });

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                sidebar.classList.remove('drawer-open');
            });
        }

        document.addEventListener('click', (e) => {
            if (sidebar.classList.contains('drawer-open') && !sidebar.contains(e.target) && e.target !== toggleBtn) {
                sidebar.classList.remove('drawer-open');
            }
        });
    }
}

// Global Alert Utility
function triggerAlertToast(title, message) {
    let overlay = document.getElementById('custom-alert-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'custom-alert-overlay';
        overlay.className = 'custom-alert-overlay';
        overlay.innerHTML = `
            <div class="alert-modal-card">
                <i class="fa-solid fa-circle-check alert-icon-check"></i>
                <h3 id="alert-title-txt">Action Successful</h3>
                <p id="alert-desc-txt"></p>
            </div>
        `;
        document.body.appendChild(overlay);
    }
    
    document.getElementById('alert-title-txt').innerText = title;
    document.getElementById('alert-desc-txt').innerText = message;
    overlay.classList.add('show');
    
    setTimeout(() => {
        overlay.classList.remove('show');
    }, 2800);
}

// Sign Out Handler
function handleSignOut() {
    sessionStorage.clear();
    window.location.href = 'login.html';
}

// Search and Filter logic for Tables
function applyTableFilter(searchInputId, tableId) {
    const searchInput = document.getElementById(searchInputId);
    const table = document.getElementById(tableId);
    if (!searchInput || !table) return;

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        const rows = table.querySelectorAll('tbody tr');

        rows.forEach(row => {
            if (row.classList.contains('no-data-row')) return;
            const textContent = row.textContent.toLowerCase();
            if (textContent.includes(query)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        });
    });
}

// =========================================================================
// TRAVELER DASHBOARD MODULES
// =========================================================================

function initTravelerDashboard() {
    // Check Auth
    if (sessionStorage.getItem('userRole') !== 'traveler') {
        sessionStorage.setItem('userRole', 'traveler');
    }

    // Load tables
    renderTravelerTables();
    renderTimeline();
    renderTravelCalendar();
    renderTravelerPreferences();

    // Apply filters
    applyTableFilter('traveler-flights-search', 'flight-bookings-table');
    applyTableFilter('traveler-hotels-search', 'hotel-bookings-table');
    applyTableFilter('traveler-cars-search', 'car-rentals-table');

    // Init Charts
    initTravelerCharts();

    // Init Map
    initTravelerMap();
}

function renderTravelerTables() {
    const flightBody = document.getElementById('flight-bookings-body');
    const hotelBody = document.getElementById('hotel-bookings-body');
    const carBody = document.getElementById('car-rentals-body');

    // Query localStorage bookings
    const localBookings = JSON.parse(localStorage.getItem('bookings')) || [];
    
    // Map localStorage bookings to schema
    const formattedLocal = localBookings.map(b => ({
        id: b.id || 'TX-' + Math.floor(1000 + Math.random() * 9000),
        type: 'car',
        title: b.carName || 'Premium Rental Car',
        date: `${b.pickupDate} to ${b.returnDate}`,
        details: `Chauffeur: ${b.chauffeur} | Pickup: ${b.pickupLoc || 'Airport Hub'}`,
        cost: b.totalCost || 15000,
        status: b.status || 'confirmed'
    }));

    // Combine local bookings and mockup records
    const allBookings = [...formattedLocal, ...mockBookings];

    if (flightBody) {
        flightBody.innerHTML = '';
        const flights = allBookings.filter(b => b.type === 'flight');
        flights.forEach(f => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>#${f.id}</strong></td>
                <td>${f.title}</td>
                <td>${f.date}</td>
                <td>${f.details}</td>
                <td>₹${f.cost.toLocaleString()}</td>
                <td><span class="badge-status ${f.status === 'confirmed' ? 'success' : 'info'}">${f.status}</span></td>
                <td>
                    <button class="btn-icon-only" onclick="window.location.href='404.html'" title="Download Ticket"><i class="fa-solid fa-download"></i></button>
                </td>
            `;
            flightBody.appendChild(tr);
        });
    }

    if (hotelBody) {
        hotelBody.innerHTML = '';
        const hotels = allBookings.filter(b => b.type === 'hotel');
        hotels.forEach(h => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>#${h.id}</strong></td>
                <td>${h.title}</td>
                <td>${h.date}</td>
                <td>${h.details}</td>
                <td>₹${h.cost.toLocaleString()}</td>
                <td><span class="badge-status ${h.status === 'confirmed' ? 'success' : 'info'}">${h.status}</span></td>
                <td>
                    <button class="btn-icon-only" onclick="window.location.href='404.html'" title="Get Voucher"><i class="fa-solid fa-receipt"></i></button>
                </td>
            `;
            hotelBody.appendChild(tr);
        });
    }

    if (carBody) {
        carBody.innerHTML = '';
        const cars = allBookings.filter(b => b.type === 'car');
        cars.forEach(c => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>#${c.id}</strong></td>
                <td>${c.title}</td>
                <td>${c.date}</td>
                <td>${c.details}</td>
                <td>₹${c.cost.toLocaleString()}</td>
                <td><span class="badge-status ${c.status === 'confirmed' || c.status === 'Confirmed' ? 'success' : c.status === 'completed' || c.status === 'Completed' ? 'info' : 'danger'}">${c.status}</span></td>
                <td>
                    <button class="btn-icon-only" onclick="window.location.href='404.html'" title="View Agreement"><i class="fa-solid fa-file-contract"></i></button>
                </td>
            `;
            carBody.appendChild(tr);
        });
    }
}

function renderTimeline() {
    const container = document.getElementById('timeline-container');
    if (!container) return;

    container.innerHTML = '';
    const activeTimeline = [
        { title: 'Flight DL-829 Departure', date: 'June 20, 2026 - 08:30 AM', desc: 'Indira Gandhi Int Airport, Delhi Terminal 2', node: 'success' },
        { title: 'Porsche Taycan Pickup', date: 'June 20, 2026 - 11:30 AM', desc: 'Stackly Airport Pickup Hub, Mumbai Terminal 1', node: 'warning' },
        { title: 'The Oberoi Suite Check-In', date: 'June 20, 2026 - 02:00 PM', desc: 'Nariman Point, Mumbai. Booking ref: TX-4030', node: 'info' },
        { title: 'Client Meeting - Reliance Center', date: 'June 22, 2026 - 10:00 AM', desc: 'Corporate presentation, Bandra Kurla Complex', node: 'primary' }
    ];

    activeTimeline.forEach(t => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.innerHTML = `
            <div class="timeline-node ${t.node}"></div>
            <div class="timeline-card">
                <div class="timeline-info-primary">
                    <h4>${t.title}</h4>
                    <p><i class="fa-regular fa-clock" style="margin-right: 6px;"></i>${t.date}</p>
                </div>
                <div class="timeline-meta">
                    <div class="meta-block">
                        <span>Details</span>
                        <span>${t.desc}</span>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(item);
    });
}

function renderTravelCalendar() {
    const calendarGrid = document.getElementById('calendar-grid');
    if (!calendarGrid) return;

    calendarGrid.innerHTML = '';
    
    // Render Day Names
    const dayNames = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
    dayNames.forEach(d => {
        const cell = document.createElement('div');
        cell.className = 'cal-day-name';
        cell.textContent = d;
        calendarGrid.appendChild(cell);
    });

    // Dummy Calendar for June 2026 (starts on Monday)
    for (let i = 1; i <= 30; i++) {
        const cell = document.createElement('div');
        cell.className = 'cal-cell';
        cell.textContent = i;
        
        // Highlight dates corresponding to upcoming reservation: June 20 to 24
        if (i >= 20 && i <= 24) {
            cell.classList.add('active-booking');
            cell.title = 'Active Reservation (Mumbai Trip)';
        }
        
        calendarGrid.appendChild(cell);
    }
}

function renderTravelerPreferences() {
    const airlinesList = document.getElementById('pref-airlines');
    const hotelsList = document.getElementById('pref-hotels');

    if (airlinesList) {
        airlinesList.innerHTML = `
            <div class="pref-chip active"><i class="fa-solid fa-plane"></i> Singapore Airlines</div>
            <div class="pref-chip active"><i class="fa-solid fa-plane"></i> Emirates</div>
            <div class="pref-chip"><i class="fa-solid fa-plane"></i> Qatar Airways</div>
            <div class="pref-chip"><i class="fa-solid fa-plane"></i> Lufthansa</div>
        `;
    }

    if (hotelsList) {
        hotelsList.innerHTML = `
            <div class="pref-chip active"><i class="fa-solid fa-hotel"></i> Marriott Bonvoy</div>
            <div class="pref-chip active"><i class="fa-solid fa-hotel"></i> Taj Hotels</div>
            <div class="pref-chip"><i class="fa-solid fa-hotel"></i> Hyatt Regency</div>
            <div class="pref-chip"><i class="fa-solid fa-hotel"></i> Hilton Honors</div>
        `;
    }
}

// Traveler Forms
function handleTravelerProfileSave(e) {
    e.preventDefault();
    const name = document.getElementById('traveler-name').value;
    sessionStorage.setItem('userName', name);
    initSharedUserBadge();
    triggerAlertToast('Profile Saved', 'Your contact information has been updated securely.');
}

function handleTravelerSettingsSave(e) {
    e.preventDefault();
    triggerAlertToast('Settings Updated', 'Notification rules and security settings successfully saved.');
}

// traveler map (destination paths)
function initTravelerMap() {
    const mapDiv = document.getElementById('traveler-map');
    if (!mapDiv) return;

    // Build leaflet map
    const map = L.map('traveler-map').setView([19.0760, 72.8777], 5);
    window.travelerMap = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    // Traveler markers
    const destinations = [
        { name: 'Delhi (Origin)', coords: [28.6139, 77.2090] },
        { name: 'Mumbai (Active Reservation)', coords: [19.0760, 72.8777] },
        { name: 'Bangalore (Past Trip)', coords: [12.9716, 77.5946] }
    ];

    destinations.forEach(dest => {
        const markerIcon = L.divIcon({
            className: 'custom-map-marker',
            html: `<div style="background-color: #F97316; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 8px #F97316;"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6]
        });

        L.marker(dest.coords, { icon: markerIcon })
            .addTo(map)
            .bindPopup(`<strong>${dest.name}</strong>`);
    });

    // Draw route line between Delhi and Mumbai
    L.polyline([[28.6139, 77.2090], [19.0760, 72.8777]], {
        color: '#F97316',
        weight: 3,
        dashArray: '5, 8',
        opacity: 0.8
    }).addTo(map);
}

// Traveler Charts Builder
function initTravelerCharts() {
    // Apex Chart Default Options
    const chartBaseOptions = {
        theme: { mode: 'dark' },
        chart: {
            foreColor: '#9CA3AF',
            background: 'transparent',
            toolbar: { show: false }
        },
        colors: ['#F97316', '#3B82F6', '#10B981', '#F59E0B'],
        grid: {
            borderColor: '#222222',
            strokeDashArray: 4
        }
    };

    // 1. Spend Chart (Line)
    const spendOptions = {
        ...chartBaseOptions,
        chart: {
            ...chartBaseOptions.chart,
            type: 'area',
            height: 250
        },
        series: [{
            name: 'Travel Spend (₹)',
            data: [45000, 62000, 38000, 95000, 120000, 85000]
        }],
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
        },
        stroke: { curve: 'smooth', colors: ['#F97316'], width: 3 },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.45,
                opacityTo: 0.05,
                stops: [0, 90, 100]
            }
        }
    };
    const spendChart = new ApexCharts(document.querySelector("#traveler-spend-chart"), spendOptions);
    spendChart.render();

    // 2. Status Chart (Donut)
    const statusOptions = {
        ...chartBaseOptions,
        chart: {
            ...chartBaseOptions.chart,
            type: 'donut',
            height: 250
        },
        series: [3, 22, 1], // Active, Completed, Cancelled
        labels: ['Active / Upcoming', 'Completed', 'Cancelled'],
        stroke: { colors: ['#1A1A1A'], width: 2 },
        legend: { position: 'bottom' }
    };
    const statusChart = new ApexCharts(document.querySelector("#traveler-status-donut"), statusOptions);
    statusChart.render();

    // 3. Reservation Distribution Status
    const resOptions = {
        ...chartBaseOptions,
        chart: {
            ...chartBaseOptions.chart,
            type: 'bar',
            height: 200
        },
        series: [{
            name: 'Bookings',
            data: [12, 8, 6] // Flights, Hotels, Cars
        }],
        xaxis: {
            categories: ['Flights', 'Hotels', 'Car Rentals']
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
                horizontal: true,
                distributed: true
            }
        },
        legend: { show: false }
    };
    const resChart = new ApexCharts(document.querySelector("#traveler-res-status-chart"), resOptions);
    resChart.render();

    // 4. Expenses breakdown (Pie)
    const expenseOptions = {
        ...chartBaseOptions,
        chart: {
            ...chartBaseOptions.chart,
            type: 'pie',
            height: 250
        },
        series: [45, 30, 15, 10], // Flight, Hotel, Transport, Meals
        labels: ['Flights', 'Hotel Bookings', 'Car Rentals', 'Meals & Others'],
        stroke: { colors: ['#1A1A1A'], width: 2 },
        legend: { position: 'bottom' }
    };
    const expenseChart = new ApexCharts(document.querySelector("#traveler-expense-pie"), expenseOptions);
    expenseChart.render();

    // 5. Travel Frequency (Column Bar)
    const freqOptions = {
        ...chartBaseOptions,
        chart: {
            ...chartBaseOptions.chart,
            type: 'bar',
            height: 250
        },
        series: [{
            name: 'Trips Taken',
            data: [3, 4, 2, 6, 8, 5]
        }],
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
        },
        plotOptions: {
            bar: {
                borderRadius: 6,
                columnWidth: '50%'
            }
        }
    };
    const freqChart = new ApexCharts(document.querySelector("#traveler-freq-bar"), freqOptions);
    freqChart.render();

    // 6. Carbon emissions trend (Area)
    const carbonOptions = {
        ...chartBaseOptions,
        chart: {
            ...chartBaseOptions.chart,
            type: 'area',
            height: 250
        },
        colors: ['#10B981'],
        series: [{
            name: 'Carbon Footprint (kg CO2)',
            data: [380, 410, 290, 480, 520, 310]
        }],
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
        },
        stroke: { curve: 'smooth', width: 3 },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.35,
                opacityTo: 0.05,
                stops: [0, 90, 100]
            }
        }
    };
    const carbonChart = new ApexCharts(document.querySelector("#traveler-carbon-chart"), carbonOptions);
    carbonChart.render();
}

// =========================================================================
// FLEET MANAGER DASHBOARD MODULES
// =========================================================================

function initFleetManagerDashboard() {
    // Check Auth
    if (sessionStorage.getItem('userRole') !== 'fleet-manager') {
        sessionStorage.setItem('userRole', 'fleet-manager');
    }

    // Load elements
    renderFleetTables();
    renderFleetDriversList();

    // Filters
    applyTableFilter('fleet-allocation-search', 'vehicle-allocation-table');
    applyTableFilter('fleet-tracking-search', 'active-trips-table');
    applyTableFilter('fleet-drivers-search', 'driver-management-table');

    // Init Charts
    initFleetCharts();

    // Init Map
    initFleetMap();
}

function renderFleetTables() {
    const allocationBody = document.getElementById('vehicle-allocation-body');
    const trackingBody = document.getElementById('active-trips-body');
    const maintenanceBody = document.getElementById('maintenance-log-body');

    if (allocationBody) {
        allocationBody.innerHTML = '';
        const pendingAllocations = [
            { id: 'AL-512', traveler: 'Rahul Dev', vehicle: 'Porsche Taycan EV', dates: 'June 20 - June 24', driver: 'Vikram Singh', status: 'pending' },
            { id: 'AL-513', traveler: 'Priya Ram', vehicle: 'Audi e-tron GT', dates: 'June 22 - June 23', driver: 'Unassigned', status: 'pending' }
        ];

        pendingAllocations.forEach(a => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>#${a.id}</strong></td>
                <td>${a.traveler}</td>
                <td>${a.vehicle}</td>
                <td>${a.dates}</td>
                <td>
                    <select class="filter-select" style="padding: 6px 12px; font-size: 0.8rem;">
                        <option>Vikram Singh</option>
                        <option>Arun Varma</option>
                        <option>Devendra Gowda</option>
                        <option>Self Drive</option>
                    </select>
                </td>
                <td><span class="badge-status warning">${a.status}</span></td>
                <td>
                    <div style="display:flex; gap: 8px;">
                        <button class="btn-primary" style="padding: 6px 12px; font-size: 0.75rem; box-shadow: none;" onclick="approveAllocation('${a.id}')">Approve</button>
                        <button class="btn-secondary" style="padding: 6px 12px; font-size: 0.75rem;" onclick="triggerAlertToast('Allocation Rejected', 'Request ${a.id} has been declined.')">Decline</button>
                    </div>
                </td>
            `;
            allocationBody.appendChild(tr);
        });
    }

    if (trackingBody) {
        trackingBody.innerHTML = '';
        mockVehicles.filter(v => v.status === 'active').forEach(v => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${v.reg}</strong></td>
                <td>${v.name}</td>
                <td>${v.driver}</td>
                <td>${v.mileage}</td>
                <td>₹${v.cost.toLocaleString()}</td>
                <td><span class="badge-status success">En Route</span></td>
                <td>
                    <button class="btn-icon-only" onclick="focusOnVehicle('${v.name}')" title="Locate Vehicle"><i class="fa-solid fa-location-crosshairs"></i></button>
                </td>
            `;
            trackingBody.appendChild(tr);
        });
    }

    if (maintenanceBody) {
        maintenanceBody.innerHTML = '';
        mockVehicles.filter(v => v.status === 'maintenance').forEach(v => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${v.reg}</strong></td>
                <td>${v.name}</td>
                <td>Scheduled Service</td>
                <td>Brake pads replacement & software patch</td>
                <td>₹15,400</td>
                <td><span class="badge-status danger">In Shop</span></td>
                <td>
                    <button class="btn-primary" style="padding: 6px 12px; font-size: 0.75rem; box-shadow: none;" onclick="triggerAlertToast('Service Completed', '${v.name} is now certified back into active operation.')">Release</button>
                </td>
            `;
            maintenanceBody.appendChild(tr);
        });
    }
}

function approveAllocation(id) {
    triggerAlertToast('Allocation Confirmed', `Reservation ${id} has been allocated, driver assigned, and e-ticket pushed to traveler.`);
}

function renderFleetDriversList() {
    const body = document.getElementById('driver-management-body');
    if (!body) return;

    body.innerHTML = '';
    mockDrivers.forEach(d => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${d.id}</strong></td>
            <td>${d.name}</td>
            <td><code>${d.license}</code></td>
            <td>${d.score}</td>
            <td><span class="badge-status ${d.status === 'available' ? 'success' : 'info'}">${d.status}</span></td>
            <td>
                <button class="btn-icon-only" onclick="triggerAlertToast('Driver Log Requested', 'Viewing background screening check for ${d.name}.')" title="Verify License"><i class="fa-solid fa-user-shield"></i></button>
            </td>
        `;
        body.appendChild(tr);
    });
}

function focusOnVehicle(name) {
    triggerAlertToast('Tracking Vehicle', `Focusing GPS camera tracking on ${name} in real-time.`);
}

// Fleet Forms
function handleAddVehicleSubmit(e) {
    e.preventDefault();
    window.location.href = '404.html';
}

function handleAddDriverSubmit(e) {
    e.preventDefault();
    const name = document.getElementById('driver-name').value;
    triggerAlertToast('Driver Registered', `${name} successfully registered. System dispatched verification links.`);
    e.target.reset();
}

function handleFleetPolicySubmit(e) {
    e.preventDefault();
    window.location.href = '404.html';
}

// Fleet manager map (Live tracking pins)
function initFleetMap() {
    const mapDiv = document.getElementById('fleet-tracking-map');
    if (!mapDiv) return;

    const map = L.map('fleet-tracking-map').setView([20.5937, 78.9629], 5);
    window.fleetMap = map;

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
    }).addTo(map);

    // Live coordinates
    const fleetLocations = [
        { name: 'Porsche Taycan (Vikram)', coords: [19.0760, 72.8777], speed: '55 km/h', fuel: '88% Charge' },
        { name: 'Rolls-Royce Phantom (Devendra)', coords: [28.6139, 77.2090], speed: '0 km/h (Idle)', fuel: '72% Gas' },
        { name: 'Range Rover (Rahul - Self)', coords: [11.0168, 76.9558], speed: '82 km/h', fuel: '68% Gas' },
        { name: 'Mercedes Maybach (Sanjay)', coords: [12.9716, 77.5946], speed: '62 km/h', fuel: '94% Gas' }
    ];

    fleetLocations.forEach(loc => {
        const markerIcon = L.divIcon({
            className: 'custom-map-marker',
            html: `<div style="background-color: #F97316; width: 14px; height: 14px; border-radius: 50%; border: 2.5px solid white; box-shadow: 0 0 10px #F97316; animation: blinker 2s linear infinite;"></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7]
        });

        // Add blink keyframes dynamically if not present
        if (!document.getElementById('map-marker-style')) {
            const style = document.createElement('style');
            style.id = 'map-marker-style';
            style.innerHTML = `
                @keyframes blinker {
                    50% { opacity: 0.4; transform: scale(0.85); }
                }
            `;
            document.head.appendChild(style);
        }

        L.marker(loc.coords, { icon: markerIcon })
            .addTo(map)
            .bindPopup(`
                <strong>${loc.name}</strong><br>
                <span>Speed: ${loc.speed}</span><br>
                <span>Status: ${loc.fuel}</span>
            `);
    });
}

// Fleet manager charts
function initFleetCharts() {
    const chartBaseOptions = {
        theme: { mode: 'dark' },
        chart: {
            foreColor: '#9CA3AF',
            background: 'transparent',
            toolbar: { show: false }
        },
        colors: ['#F97316', '#10B981', '#3B82F6', '#F59E0B'],
        grid: {
            borderColor: '#222222',
            strokeDashArray: 4
        }
    };

    // 1. Utilization Radial Gauge (Dashboard)
    const utilOptions = {
        ...chartBaseOptions,
        chart: {
            ...chartBaseOptions.chart,
            type: 'radialBar',
            height: 250
        },
        series: [78], // 78% fleet utilization
        labels: ['Utilization Rate'],
        plotOptions: {
            radialBar: {
                hollow: { size: '65%' },
                track: { background: '#222' },
                dataLabels: {
                    name: { show: false },
                    value: {
                        color: '#FFF',
                        fontSize: '28px',
                        fontWeight: 700,
                        show: true
                    }
                }
            }
        }
    };
    const utilChart = new ApexCharts(document.querySelector("#fleet-utilization-gauge"), utilOptions);
    utilChart.render();

    // 2. Status Chart (Donut)
    const vehicleStatusOptions = {
        ...chartBaseOptions,
        chart: {
            ...chartBaseOptions.chart,
            type: 'donut',
            height: 250
        },
        series: [32, 8, 5], // Active, Idle, Maintenance
        labels: ['Active Vehicles', 'Idle Vehicles', 'Under Maintenance'],
        stroke: { colors: ['#1A1A1A'], width: 2 },
        legend: { position: 'bottom' }
    };
    const vehicleStatusChart = new ApexCharts(document.querySelector("#fleet-status-donut"), vehicleStatusOptions);
    vehicleStatusChart.render();

    // 3. Operational Costs Trend (Line/Area)
    const costOptions = {
        ...chartBaseOptions,
        chart: {
            ...chartBaseOptions.chart,
            type: 'area',
            height: 250
        },
        series: [{
            name: 'Operational Cost (₹)',
            data: [180000, 210000, 195000, 245000, 280000, 240000]
        }],
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
        },
        stroke: { curve: 'smooth', width: 3 },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.45,
                opacityTo: 0.05,
                stops: [0, 90, 100]
            }
        }
    };
    const costChart = new ApexCharts(document.querySelector("#fleet-cost-trend"), costOptions);
    costChart.render();

    // 4. Route efficiency comparison (Bar/Column)
    const routeOptions = {
        ...chartBaseOptions,
        chart: {
            ...chartBaseOptions.chart,
            type: 'bar',
            height: 220
        },
        series: [{
            name: 'Planned (km)',
            data: [450, 600, 320, 900]
        }, {
            name: 'Actual Traveled (km)',
            data: [420, 640, 310, 850]
        }],
        xaxis: {
            categories: ['Route 1', 'Route 2', 'Route 3', 'Route 4']
        },
        plotOptions: {
            bar: {
                borderRadius: 4,
                columnWidth: '55%'
            }
        }
    };
    const routeChart = new ApexCharts(document.querySelector("#fleet-route-efficiency"), routeOptions);
    routeChart.render();

    // 5. Fuel consumption trend (Line)
    const fuelOptions = {
        ...chartBaseOptions,
        chart: {
            ...chartBaseOptions.chart,
            type: 'line',
            height: 250
        },
        series: [{
            name: 'Gas Consumption (L)',
            data: [1200, 1450, 1100, 1600, 1850, 1500]
        }, {
            name: 'EV Power Used (kWh)',
            data: [800, 950, 990, 1200, 1400, 1550]
        }],
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
        },
        stroke: { width: 3, curve: 'smooth' }
    };
    const fuelChart = new ApexCharts(document.querySelector("#fleet-fuel-trend"), fuelOptions);
    fuelChart.render();

    // 6. Maintenance Cost Breakdown (Pie)
    const maintenanceOptions = {
        ...chartBaseOptions,
        chart: {
            ...chartBaseOptions.chart,
            type: 'pie',
            height: 250
        },
        series: [40, 25, 20, 15], // Tyres, Motor, Inspections, Body/Cleaning
        labels: ['Engine & Electric', 'Tires & Brakes', 'Inspections & Taxes', 'Cleaning & Bodywork'],
        stroke: { colors: ['#1A1A1A'], width: 2 },
        legend: { position: 'bottom' }
    };
    const maintenanceChart = new ApexCharts(document.querySelector("#fleet-maintenance-pie"), maintenanceOptions);
    maintenanceChart.render();

    // 7. Fleet Category distribution (Bar)
    const categoryOptions = {
        ...chartBaseOptions,
        chart: {
            ...chartBaseOptions.chart,
            type: 'bar',
            height: 250
        },
        series: [{
            name: 'Active Days / Month',
            data: [28, 22, 25, 18]
        }],
        xaxis: {
            categories: ['VIP Luxury', 'Luxury Sedan', 'EV Sports', 'Premium SUVs']
        },
        plotOptions: {
            bar: {
                borderRadius: 6,
                columnWidth: '45%',
                distributed: true
            }
        },
        legend: { show: false }
    };
    const categoryChart = new ApexCharts(document.querySelector("#fleet-utilization-bar"), categoryOptions);
    categoryChart.render();

    // 8. Fleet Health Score (Radial Gauge)
    const healthOptions = {
        ...chartBaseOptions,
        chart: {
            ...chartBaseOptions.chart,
            type: 'radialBar',
            height: 250
        },
        colors: ['#10B981'],
        series: [92], // 92% health score
        labels: ['Fleet Health'],
        plotOptions: {
            radialBar: {
                hollow: { size: '60%' },
                track: { background: '#222' },
                dataLabels: {
                    name: { show: false },
                    value: {
                        color: '#FFF',
                        fontSize: '26px',
                        fontWeight: 700,
                        show: true
                    }
                }
            }
        }
    };
    const healthChart = new ApexCharts(document.querySelector("#fleet-health-gauge"), healthOptions);
    healthChart.render();
}
