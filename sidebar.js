const CAR_CRM_NAV = [
    { href: 'overview.html', label: 'Overview', icon: '◉', color: 'sky' },
    { href: 'customer-data.html', label: 'ข้อมูลลูกค้า', icon: '👤', color: 'blue' },
    { href: 'index.html', label: 'รายการคิวจอง', icon: '▦', color: 'blue' },
    { href: 'technician.html', label: 'ข้อมูลงานติดตั้ง', icon: '⚙', color: 'indigo' }, 
    //{ href: 'calendar.html', label: 'ปฏิทินคิวจอง', icon: '◷', color: 'sky' },// ซ่อนชั่วคราว
    { href: 'contact-stats.html', label: 'สถิติการติดต่อ', icon: '☎', color: 'sky' },
    { href: 'sales-summary.html', label: 'สรุปยอดขาย', icon: '฿', color: 'amber' },
    { href: 'damage.html', label: 'ความเสียหายฟิล์ม', icon: '!', color: 'rose' },
    { href: 'other-damage.html', label: 'ความเสียหายอื่นๆ', icon: '+', color: 'indigo' },
    { href: 'install-summary.html', label: 'สรุปงานฟิล์ม', icon: 'Σ', color: 'emerald' },
    { href: 'feedback-car.html', label: 'Feedback ลูกค้า', icon: '★', color: 'rose' }
];

const CAR_CRM_ADMIN_URL = 'https://www.appsheet.com/start/80996d9a-92c8-4534-ba3e-04ee20708ec7';

const CAR_CRM_TITLES = {
    'overview.html': 'Overview',
    'customer-data.html': 'ข้อมูลลูกค้า',
    'index.html': 'รายการคิวจอง',
    'technician.html': 'งานติดตั้ง',
    'calendar.html': 'ปฏิทินคิวจอง',
    'sales-dashboard.html': 'ราคาขายเดือนนี้',
    'sales-summary.html': 'สรุปยอดขาย',
    'contact-stats.html': 'สถิติการติดต่อ',
    'feedback-car.html': 'Feedback ลูกค้า',
    'sunroof.html': 'Sunroof',
    'install-summary.html': 'สรุปงานฟิล์ม',
    'technician-commission.html': 'คำนวณค่าคอมช่าง',
    'damage.html': 'ความเสียหาย',
    'other-damage.html': 'ความเสียหายอื่นๆ'
};

function ensureCarCrmSidebarStyles() {
    if (document.getElementById('car-crm-sidebar-styles')) return;

    const style = document.createElement('style');
    style.id = 'car-crm-sidebar-styles';
    style.textContent = `
        [data-sidebar-panel].car-crm-sidebar-panel {
            background: linear-gradient(180deg, rgba(248, 250, 252, 0.98) 0%, rgba(239, 246, 255, 0.96) 55%, rgba(248, 250, 252, 0.98) 100%) !important;
            border-right-color: rgba(59, 130, 246, 0.18) !important;
            color: #0f172a !important;
            box-shadow: 12px 0 32px rgba(15, 23, 42, 0.11) !important;
        }

        .car-crm-sidebar-panel .car-crm-brand-mark {
            background: linear-gradient(135deg, #2563eb, #0ea5e9) !important;
            box-shadow: 0 10px 24px rgba(37, 99, 235, 0.22) !important;
        }

        .car-crm-sidebar-panel .car-crm-brand-title {
            color: #0f172a !important;
        }

        .car-crm-sidebar-panel .car-crm-sales-title {
            color: #075985 !important;
        }

        .car-crm-sidebar-panel .car-crm-brand-subtitle,
        .car-crm-sidebar-panel .car-crm-section-label {
            color: rgba(71, 85, 105, 0.74) !important;
        }

        .car-crm-sidebar-panel .car-crm-divider {
            background: rgba(59, 130, 246, 0.14) !important;
        }

        .car-crm-sidebar-panel .car-crm-operations {
            border-top-color: rgba(59, 130, 246, 0.14) !important;
        }

        .car-crm-sidebar-panel .car-crm-nav-link {
            border: 1px solid transparent;
            color: #475569 !important;
        }

        .car-crm-sidebar-panel .car-crm-nav-link:hover {
            background: rgba(59, 130, 246, 0.08) !important;
            border-color: rgba(59, 130, 246, 0.14);
            color: #1e40af !important;
        }

        .car-crm-sidebar-panel .car-crm-nav-link-active {
            background: #2563eb !important;
            border-color: rgba(37, 99, 235, 0.24);
            color: #ffffff !important;
            box-shadow: 0 10px 24px rgba(37, 99, 235, 0.20) !important;
        }

        .car-crm-sidebar-panel .car-crm-nav-icon {
            background: rgba(37, 99, 235, 0.09) !important;
            color: #2563eb !important;
            box-shadow: inset 0 0 0 1px rgba(37, 99, 235, 0.08) !important;
        }

        .car-crm-sidebar-panel .car-crm-nav-link-active .car-crm-nav-icon {
            background: #ffffff !important;
            color: #1d4ed8 !important;
            box-shadow: 0 10px 22px rgba(15, 23, 42, 0.16) !important;
        }

        .car-crm-sidebar-panel .car-crm-close {
            background: rgba(255, 255, 255, 0.94) !important;
            border-color: rgba(37, 99, 235, 0.26) !important;
            color: #1d4ed8 !important;
            box-shadow: 0 5px 14px rgba(37, 99, 235, 0.14) !important;
        }

        .car-crm-sidebar-panel .car-crm-close:hover {
            background: #2563eb !important;
            border-color: #2563eb !important;
            color: #ffffff !important;
            box-shadow: 0 8px 18px rgba(37, 99, 235, 0.26) !important;
            transform: translateY(-1px);
        }

        .car-crm-sidebar-panel .car-crm-close:focus-visible {
            outline: 3px solid rgba(59, 130, 246, 0.30);
            outline-offset: 2px;
        }

        .car-crm-sidebar-panel .car-crm-close:active {
            transform: translateY(0) scale(0.96);
        }

        .car-crm-sales-card {
            background: linear-gradient(135deg, #ecfeff 0%, #bae6fd 100%) !important;
            border-color: rgba(14, 165, 233, 0.34) !important;
            color: #075985 !important;
            box-shadow: 0 14px 32px rgba(14, 165, 233, 0.14) !important;
        }

        .car-crm-sales-card:hover {
            background: linear-gradient(135deg, #cffafe 0%, #93c5fd 100%) !important;
            box-shadow: 0 18px 38px rgba(14, 165, 233, 0.20) !important;
        }

        .car-crm-sales-card .car-crm-sales-icon {
            background: rgba(255, 255, 255, 0.92) !important;
            color: #0284c7 !important;
        }

        [data-sidebar-open].car-crm-sidebar-open {
            background: rgba(239, 246, 255, 0.96) !important;
            border-color: rgba(59, 130, 246, 0.22) !important;
            color: #1d4ed8 !important;
            box-shadow: 0 10px 24px rgba(30, 64, 175, 0.12) !important;
        }
    `;

    document.head.appendChild(style);
}

function currentCarCrmPage() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    return page === '' ? 'index.html' : page;
}

function iconColorClass(color, isActive) {
    if (isActive) return 'bg-white text-blue-600 shadow-sm';

    const colors = {
        blue: 'bg-blue-50 text-blue-600',
        sky: 'bg-sky-50 text-sky-600',
        amber: 'bg-amber-50 text-amber-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        rose: 'bg-rose-50 text-rose-600',
        indigo: 'bg-indigo-50 text-indigo-600'
    };

    return colors[color] || 'bg-slate-100 text-slate-500';
}

function navItemHtml(item, activePage) {
    const isActive = item.href === activePage;

    const linkClass = isActive
        ? 'car-crm-nav-link car-crm-nav-link-active flex items-center gap-3 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm'
        : 'car-crm-nav-link flex items-center gap-3 rounded-2xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900';

    const iconClass = `car-crm-nav-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-base font-bold ${iconColorClass(item.color, isActive)}`;

    return `
        <a href="${item.href}" class="${linkClass}">
            <span class="${iconClass}">${item.icon}</span>
            <span class="flex-1">${item.label}</span>
        </a>
    `;
}

function renderCarCrmSidebar() {
    const host = document.querySelector('[data-car-crm-sidebar]');
    if (!host) return;

    ensureCarCrmSidebarStyles();

    const activePage = currentCarCrmPage();
    const pageTitle = CAR_CRM_TITLES[activePage] || 'CAR CRM';
    const navLinks = CAR_CRM_NAV.map(item => navItemHtml(item, activePage)).join('');
    const salesCardActive = activePage === 'sales-dashboard.html';
    host.innerHTML = `
        <button type="button" data-sidebar-open class="car-crm-sidebar-open fixed left-4 top-4 z-50 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-4 py-2 text-sm font-bold text-slate-700 shadow-sm backdrop-blur">
            <span>☰</span>
            เมนู
        </button>

        <div data-sidebar-overlay class="fixed inset-0 z-40 hidden bg-slate-900/20 backdrop-blur-sm lg:hidden"></div>

        <aside data-sidebar-panel class="car-crm-sidebar-panel fixed inset-y-0 left-0 z-50 flex w-72 -translate-x-full flex-col border-r border-slate-200 bg-white/85 text-slate-900 shadow-xl backdrop-blur-2xl transition-transform duration-200 lg:z-40 lg:shadow-none">
            
            <div class="px-5 py-6">
                <div class="flex items-center gap-3">
                    <div class="car-crm-brand-mark flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-sm font-extrabold text-white shadow-sm">
                        CRM
                    </div>

                    <div class="min-w-0">
                        <div class="car-crm-brand-title truncate text-lg font-extrabold leading-tight text-slate-900">CAR CRM</div>
                        <div class="car-crm-brand-subtitle mt-0.5 text-xs font-medium text-slate-500">จัดการคิวติดตั้งฟิล์ม</div>
                    </div>

                    <button type="button" data-sidebar-close aria-label="ปิดเมนูด้านข้าง" title="ปิดเมนู" class="car-crm-close ml-auto inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full border border-blue-200 bg-white/90 px-3 text-sm font-bold text-blue-700 shadow-sm transition-all">
                        <span>ปิด</span>
                        <svg aria-hidden="true" focusable="false" class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                            <path stroke-linecap="round" d="M6 6l12 12M18 6 6 18"></path>
                        </svg>
                    </button>
                </div>
            </div>

            <div class="car-crm-divider mx-5 h-px bg-slate-200"></div>

            <nav class="flex-1 overflow-y-auto px-4 py-5">
                <div>
                    <div class="car-crm-section-label mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                        Main
                    </div>

                    <div class="space-y-0.5">
                        ${navLinks}
                    </div>
                </div>

                <div class="car-crm-operations mt-7 border-t border-slate-200 pt-5">
                    <div class="car-crm-section-label mb-2 px-2 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                        Operations
                    </div>

                    <a href="${CAR_CRM_ADMIN_URL}" target="_blank" rel="noopener noreferrer" class="car-crm-nav-link flex items-center gap-3 rounded-2xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900">
                        <span class="car-crm-nav-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-base font-bold text-indigo-600">↗</span>
                        <span class="flex-1">Admin Panel</span>
                    </a>

                    <a href="https://solar-film.github.io/BB/" target="_blank" rel="noopener noreferrer" class="car-crm-nav-link mt-0.5 flex items-center gap-3 rounded-2xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900">
                        <span class="car-crm-nav-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-base font-bold text-sky-600">BB</span>
                        <span class="flex-1">meeting</span>
                    </a>

                    <a href="accounting.html" target="_blank" rel="noopener noreferrer" class="car-crm-nav-link mt-0.5 flex items-center gap-3 rounded-2xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900">
                        <span class="car-crm-nav-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-base">💳</span>
                        <span class="flex-1">ฝ่ายบัญชี</span>
                    </a>

                    <a href="technician-queue.html" target="_blank" rel="noopener noreferrer" class="car-crm-nav-link mt-0.5 flex items-center gap-3 rounded-2xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900">
                        <span class="car-crm-nav-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-base">🔧</span>
                        <span class="flex-1">ทีมช่าง</span>
                    </a>
                </div>
            </nav>

            <a href="sales-dashboard.html" class="car-crm-sales-card m-4 block rounded-3xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${salesCardActive ? 'border-amber-300 bg-amber-500 text-white' : 'border-amber-200 bg-amber-50/90 text-slate-900 hover:bg-amber-100'}">
                <div class="flex items-center gap-3">
                    <div class="car-crm-sales-icon flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-xl font-black ${salesCardActive ? 'text-amber-600' : 'text-amber-700'} shadow-sm">
                        ฿
                    </div>
                    <div class="min-w-0">
                        <div class="car-crm-sales-title text-base font-extrabold ${salesCardActive ? 'text-white' : 'text-slate-900'}">ราคาขายเดือนนี้</div>
                    </div>
                </div>
            </a>
        </aside>

        <header class="bg-white/90 px-4 py-4 pl-28 text-slate-900 shadow-sm ring-1 ring-slate-200 backdrop-blur lg:hidden">
            <div class="text-lg font-bold">${pageTitle}</div>
        </header>
    `;

    const panel = host.querySelector('[data-sidebar-panel]');
    const overlay = host.querySelector('[data-sidebar-overlay]');
    const openButton = host.querySelector('[data-sidebar-open]');
    const closeButton = host.querySelector('[data-sidebar-close]');
    const STORAGE_KEY = 'carCrmSidebarCollapsed';

    const isDesktop = () => window.innerWidth >= 1024;

    const setDesktopCollapsed = collapsed => {
        document.body.classList.toggle('car-crm-sidebar-collapsed', collapsed);
        localStorage.setItem(STORAGE_KEY, collapsed ? '1' : '0');
        openButton.classList.toggle('hidden', !collapsed);
        if (collapsed) {
            panel.classList.add('-translate-x-full');
        } else {
            panel.classList.remove('-translate-x-full');
        }
    };

    const openSidebar = () => {
        if (isDesktop()) {
            setDesktopCollapsed(false);
            return;
        }
        panel.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
    };

    const closeSidebar = () => {
        if (isDesktop()) {
            setDesktopCollapsed(true);
            return;
        }
        panel.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
        document.body.classList.remove('overflow-hidden');
    };

    openButton?.addEventListener('click', openSidebar);
    closeButton?.addEventListener('click', closeSidebar);
    overlay?.addEventListener('click', closeSidebar);

    host.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth < 1024) closeSidebar();
        });
    });

    window.addEventListener('keydown', event => {
        if (event.key === 'Escape') closeSidebar();
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 1024) {
            overlay.classList.add('hidden');
            document.body.classList.remove('overflow-hidden');
            setDesktopCollapsed(localStorage.getItem(STORAGE_KEY) === '1');
        } else {
            panel.classList.add('-translate-x-full');
            document.body.classList.remove('car-crm-sidebar-collapsed');
            openButton.classList.remove('hidden');
        }
    });

    if (isDesktop()) {
        setDesktopCollapsed(localStorage.getItem(STORAGE_KEY) === '1');
    } else {
        panel.classList.add('-translate-x-full');
        openButton.classList.remove('hidden');
    }
}

document.addEventListener('DOMContentLoaded', renderCarCrmSidebar);
