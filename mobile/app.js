(function () {
  'use strict';

  const Core = window.CarCrmMobileCore;
  if (!Core) throw new Error('ไม่พบ mobile core');

  const SHEET_ID = '1u__xYWoWZpmrnquc-Fpk19WtpcrckxSd0-_G35NWxXQ';
  const SHEETS = Object.freeze({ bookings: 'Bookings', customers: 'Customer' });

  const state = {
    appointments: [],
    selectedDate: Core.dateKeyFromDate(new Date()),
    loading: false
  };

  const dom = {};

  function cacheDom() {
    [
      'connectionText', 'refreshButton', 'previousDateButton', 'nextDateButton', 'todayButton', 'dateFilter',
      'searchInput', 'selectedDateLabel', 'appointmentCount', 'messageBox', 'lastUpdated', 'loadingState',
      'emptyState', 'tableWrap', 'scheduleBody', 'salesTotal'
    ].forEach(id => { dom[id] = document.getElementById(id); });
  }

  function bindEvents() {
    dom.refreshButton.addEventListener('click', () => loadData());
    dom.previousDateButton.addEventListener('click', () => shiftSelectedDate(-1));
    dom.nextDateButton.addEventListener('click', () => shiftSelectedDate(1));
    dom.todayButton.addEventListener('click', () => setSelectedDate(Core.dateKeyFromDate(new Date())));
    dom.dateFilter.addEventListener('change', event => setSelectedDate(event.target.value));
    dom.searchInput.addEventListener('input', renderSchedule);
    window.addEventListener('online', updateConnectionState);
    window.addEventListener('offline', updateConnectionState);
  }

  function initialise() {
    cacheDom();
    bindEvents();
    const requestedDate = new URLSearchParams(window.location.search).get('date');
    if (/^\d{4}-\d{2}-\d{2}$/.test(requestedDate || '')) state.selectedDate = requestedDate;
    dom.dateFilter.value = state.selectedDate;
    updateConnectionState();
    renderSchedule();
    loadData();
    registerServiceWorker();
  }

  function sheetCsvUrl(sheetName) {
    const url = new URL(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq`);
    url.searchParams.set('tqx', 'out:csv');
    url.searchParams.set('sheet', sheetName);
    url.searchParams.set('_', String(Date.now()));
    return url.toString();
  }

  function isInvalidCsvResponse(text) {
    const normalized = String(text || '').trim().toLowerCase();
    return !normalized || normalized.startsWith('<!doctype html') || normalized.startsWith('<html') || normalized.includes('invalid query');
  }

  async function fetchCsv(sheetName) {
    const response = await fetch(sheetCsvUrl(sheetName), { cache: 'no-store', credentials: 'omit' });
    if (!response.ok) throw new Error(`อ่านชีต ${sheetName} ไม่สำเร็จ (${response.status})`);
    const text = await response.text();
    if (isInvalidCsvResponse(text)) throw new Error(`ไม่สามารถเข้าถึงชีต ${sheetName}`);
    return Core.parseCsv(text);
  }

  async function loadData(options = {}) {
    if (state.loading) return;
    state.loading = true;
    dom.refreshButton.disabled = true;
    dom.refreshButton.classList.add('is-spinning');
    if (!options.silent) {
      dom.loadingState.classList.remove('hidden');
      dom.tableWrap.classList.add('hidden');
      dom.emptyState.classList.add('hidden');
    }
    hideMessage();

    try {
      const [bookings, customers] = await Promise.all([
        fetchCsv(SHEETS.bookings),
        fetchCsv(SHEETS.customers)
      ]);
      state.appointments = Core.buildAppointments(bookings, customers, []);
      dom.lastUpdated.textContent = `อัปเดต ${new Intl.DateTimeFormat('th-TH', { hour: '2-digit', minute: '2-digit' }).format(new Date())} น.`;
      updateConnectionState();
      renderSchedule();
    } catch (error) {
      showMessage(navigator.onLine ? error.message : 'อุปกรณ์ออฟไลน์ กรุณาเชื่อมต่ออินเทอร์เน็ตแล้วลองใหม่', 'error');
      dom.loadingState.classList.add('hidden');
      if (!state.appointments.length) {
        dom.tableWrap.classList.add('hidden');
        dom.emptyState.classList.remove('hidden');
      } else {
        renderSchedule();
      }
    } finally {
      state.loading = false;
      dom.refreshButton.disabled = false;
      dom.refreshButton.classList.remove('is-spinning');
    }
  }

  function setSelectedDate(value) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return;
    state.selectedDate = value;
    dom.dateFilter.value = value;
    renderSchedule();
  }

  function shiftSelectedDate(days) {
    const date = new Date(`${state.selectedDate}T12:00:00`);
    if (Number.isNaN(date.getTime())) return;
    date.setDate(date.getDate() + days);
    setSelectedDate(Core.dateKeyFromDate(date));
  }

  function selectedDateLabel() {
    const date = new Date(`${state.selectedDate}T12:00:00`);
    if (Number.isNaN(date.getTime())) return state.selectedDate;
    return new Intl.DateTimeFormat('th-TH', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(date);
  }

  function renderSchedule() {
    const appointments = Core.filterAppointments(state.appointments, state.selectedDate, dom.searchInput.value);
    dom.selectedDateLabel.textContent = selectedDateLabel();
    dom.appointmentCount.textContent = `${appointments.length.toLocaleString('th-TH')} คิว`;
    const salesTotal = appointments.reduce((total, appointment) => total + (Number(appointment.price) || 0), 0);
    dom.salesTotal.textContent = `${formatMoney(salesTotal)} บาท`;
    dom.loadingState.classList.toggle('hidden', !state.loading || state.appointments.length > 0);
    dom.emptyState.classList.toggle('hidden', appointments.length > 0 || state.loading);
    dom.tableWrap.classList.toggle('hidden', appointments.length === 0);
    dom.scheduleBody.innerHTML = appointments.map(renderAppointmentRow).join('');
  }

  function renderAppointmentRow(job) {
    const statusKind = Core.statusKind(job.status);
    const phoneDigits = Core.textValue(job.phone).replace(/[^\d+]/g, '');
    const phoneLink = phoneDigits
      ? `<a class="phone-link" href="tel:${Core.escapeHtml(phoneDigits)}">${Core.escapeHtml(job.phone)}</a>`
      : '';
    const amountText = job.price > 0 ? `${formatMoney(job.price)} บาท` : 'ไม่ระบุยอด';

    return `<tr>
      <td class="time-cell">
        <strong>${Core.escapeHtml(job.time)}</strong>
        <span>${Core.escapeHtml(job.id)}</span>
      </td>
      <td>
        <div class="appointment-main">
          <div class="customer-line"><strong>${Core.escapeHtml(job.customerName)}</strong>${phoneLink}</div>
          <div class="car-line">${Core.escapeHtml(job.carModel)} · ${Core.escapeHtml(job.plate)}</div>
          <div class="install-line">${Core.escapeHtml(job.film)} · ${Core.escapeHtml(job.installPosition)}</div>
          <div class="meta-line">
            <span class="badge status-${statusKind}">สถานะงาน: ${Core.escapeHtml(job.status)}</span>
            <span class="price-text">${Core.escapeHtml(amountText)}</span>
          </div>
        </div>
      </td>
    </tr>`;
  }

  function formatMoney(value) {
    return new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 }).format(Number(value) || 0);
  }

  function showMessage(message, kind = '') {
    dom.messageBox.textContent = message;
    dom.messageBox.className = `message${kind ? ` ${kind}` : ''}`;
  }

  function hideMessage() {
    dom.messageBox.textContent = '';
    dom.messageBox.className = 'message hidden';
  }

  function updateConnectionState() {
    dom.connectionText.textContent = navigator.onLine ? 'พร้อมดูตารางนัดหมาย' : 'ออฟไลน์ — ไม่สามารถโหลดข้อมูลใหม่';
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator) || !window.isSecureContext) return;
    navigator.serviceWorker.register('./sw.js?v=5', { scope: './' }).catch(error => console.warn('Service worker:', error.message));
  }

  initialise();
})();
