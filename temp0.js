
        const SHEET_ID = '1u__xYWoWZpmrnquc-Fpk19WtpcrckxSd0-_G35NWxXQ';
        const BOOKINGS_SHEET_NAME = 'Bookings';
        const CAR_MODEL_SHEET_NAME = 'Car_model';
        const COMMISSION_RATE_SHEET_NAME = 'Commission_Rate';
        const DATA_SHEET_NAME = 'data';
        const INSTALLER_SHEET_NAME = 'Detail_Installer';

        const BOOKINGS_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(BOOKINGS_SHEET_NAME)}`;
        const CAR_MODEL_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(CAR_MODEL_SHEET_NAME)}`;
        const COMMISSION_RATE_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(COMMISSION_RATE_SHEET_NAME)}`;
        const DATA_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(DATA_SHEET_NAME)}`;
        const INSTALLER_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(INSTALLER_SHEET_NAME)}`;
        const FILM_COST_CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('ต้นทุนฟิล์ม')}`;
        
        const INSTALLER_CSV_URLS = [
            INSTALLER_CSV_URL,
            `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('Detail Installer')}`,
            `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('Detail_Installers')}`,
            `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('Installer')}`,
            `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent('ช่างติดตั้ง')}`
        ];

        const LOGIN_USER = 'admin';
        const LOGIN_PASS = 'MHL741mhl+';
        const LOGIN_KEY = 'carCrmLoggedIn';
        const COMMISSION_PASS = 'oil2026';
        const COMMISSION_ACCESS_KEY = 'technicianCommissionAccess';

        const CUSTOMER_TYPE_FIELDS = ['ประเภทลูกค้า', 'Customer Type', 'CustomerType', 'customer_type'];
        const CUSTOMER_GROUPS = ['ลูกค้าใหม่', 'ลูกค้าเก่า'];
        const dom = {};
        const DOM_IDS = [
            'loginForm', 'loginUser', 'loginPass', 'loginError', 'monthFilter',
            'summaryTotal', 'summaryNew', 'summaryClaim', 'summaryFix',
            'loadingMessage', 'errorMessage', 'tableWrap', 'summaryHead', 'summaryBody',
            'lastUpdated', 'connectionStatus',
            'filterMode', 'monthFilterContainer', 'customDateContainer', 'startDateInput', 'endDateInput',
            'typeFilter', 'damageTableWrap', 'damageSummaryHead', 'damageSummaryBody', 'damageLoadingMessage'
        ];

        let rawBookings = [];
        let rawCarModels = [];
        let rawCommissionRates = [];
        let rawData = [];
        let rawInstaller = [];
        let filmCostMap = {};
        let summaryRows = [];
        let allSummaryRows = [];
        let appHasStarted = false;

        const POSITION_COLUMNS = ['บานหน้า', 'บานหลัง', 'ประตูหน้าซ้าย', 'ประตูหน้าขวา', 'ประตูหลังซ้าย', 'ประตูหลังขวา', 'ซันรูฟ', 'ทั้งคัน'];
        const COMMISSION_SECTIONS = [
            {
                key: 'fullSunroof',
                title: 'เต็มคัน + ซันรูฟ',
                rateField: 'fullSunroofRate',
                className: 'commission-section-full-sunroof',
                rateLabel: 'เรทค่าคอม/คัน (เต็มคัน + ซันรูฟ)'
            },
            {
                key: 'full',
                title: 'เต็มคัน',
                rateField: 'fullRate',
                className: 'commission-section-full',
                rateLabel: 'เรทค่าคอม/คัน (เต็มคัน)'
            },
            {
                key: 'partial',
                title: 'ประกอบคัน',
                rateField: 'fullRate',
                className: 'commission-section-partial',
                rateLabel: 'เรทค่าคอม/คัน (เต็มคัน)'
            }
        ];
        const collapsedMonths = new Set();

        function cacheDom() {
            DOM_IDS.forEach(id => {
                dom[id] = document.getElementById(id);
            });
        }

        function textValue(value, fallback = '') {
            if (value === null || value === undefined) return fallback;
            const text = String(value).trim();
            return text === '' ? fallback : text;
        }

        function escapeHtml(value) {
            return textValue(value).replace(/[&<>"']/g, char => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[char]));
        }

        function normalizeText(value) {
            return textValue(value).replace(/[\s._\-()（）/\\]+/g, '').toLowerCase();
        }

        function isCancelledStatus(value) {
            return normalizeText(value).includes('ยกเลิก');
        }

        function normalizeLookupId(value) {
            return textValue(value).replace(/[\s._\-–—/\\]+/g, '').toLowerCase();
        }

        function findField(row, candidates) {
            if (!row) return '';
            const keys = Object.keys(row).filter(key => normalizeText(key));
            const normalizedCandidates = candidates.map(normalizeText).filter(Boolean);
            const key = keys.find(item => normalizedCandidates.includes(normalizeText(item))) ||
                keys.find(item => normalizedCandidates.some(candidate => {
                    const normalizedItem = normalizeText(item);
                    if (!normalizedItem || candidate.length < 2 || normalizedItem.length < 2) return false;
                    return normalizedItem.includes(candidate) || candidate.includes(normalizedItem);
                }));
            return key ? textValue(row[key]) : '';
        }

        function parseCsv(csvText) {
            return new Promise(resolve => {
                Papa.parse(csvText, {
                    header: true,
                    skipEmptyLines: true,
                    transformHeader: header => header.trim(),
                    complete: results => resolve(results.data)
                });
            });
        }

        function isHtmlResponseText(text) {
            const trimmedText = text.trim().toLowerCase();
            return trimmedText.startsWith('<!doctype html>') ||
                trimmedText.startsWith('<html') ||
                trimmedText.includes('google.visualization.query.setresponse') ||
                trimmedText.includes('invalid query');
        }

        async function fetchCsvText(url) {
            const response = await fetch(url);
            if (!response.ok) throw new Error('Network response was not ok');
            const text = await response.text();
            if (isHtmlResponseText(text)) throw new Error('Permission denied');
            return text;
        }
        
        async function fetchCsvTexts(urls) {
            return Promise.all(urls.map(url => fetchCsvText(url).catch(() => null)));
        }

        function parseDate(value) {
            const raw = textValue(value);
            let match = raw.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
            if (match) {
                let year = parseInt(match[1], 10);
                if (year > 2400) year -= 543;
                const date = new Date(year, parseInt(match[2], 10) - 1, parseInt(match[3], 10));
                return Number.isNaN(date.getTime()) ? null : date;
            }

            match = raw.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
            if (!match) return null;
            let year = parseInt(match[3], 10);
            if (year < 100) year += 2000;
            if (year > 2400) year -= 543;
            const date = new Date(year, parseInt(match[2], 10) - 1, parseInt(match[1], 10));
            return Number.isNaN(date.getTime()) ? null : date;
        }

        function parseInputDate(dateStr) {
            if (!dateStr) return null;
            const parts = dateStr.split('-');
            if (parts.length !== 3) return null;
            return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        }

        function monthKeyFromDate(date) {
            if (!date) return 'ไม่ระบุเดือน';
            const periodDate = new Date(date.getFullYear(), date.getMonth(), 1);
            if (date.getDate() >= 26) {
                periodDate.setMonth(periodDate.getMonth() + 1);
            }
            return `${periodDate.getFullYear()}-${String(periodDate.getMonth() + 1).padStart(2, '0')}`;
        }

        function commissionPeriodRangeFromKey(monthKey) {
            if (!monthKey || monthKey === 'ไม่ระบุเดือน') return null;
            const [year, monthNumber] = monthKey.split('-').map(Number);
            if (!year || !monthNumber) return null;
            return {
                start: new Date(year, monthNumber - 2, 26),
                end: new Date(year, monthNumber - 1, 25)
            };
        }

        function formatPeriodDate(date, includeYear = false) {
            const options = { day: 'numeric', month: 'short' };
            if (includeYear) options.year = 'numeric';
            return date.toLocaleDateString('th-TH', options).replace(/พ\.ศ\.\s*/g, '');
        }

        function monthLabelFromKey(monthKey) {
            if (!monthKey || monthKey === 'ไม่ระบุเดือน') return 'ไม่ระบุเดือน';
            const range = commissionPeriodRangeFromKey(monthKey);
            if (!range) return 'ไม่ระบุเดือน';
            return `${formatPeriodDate(range.start)} - ${formatPeriodDate(range.end, true)}`;
        }

        function uniqueValues(rows, key, labelKey) {
            return [...new Map(rows.map(row => [row[key], labelKey ? row[labelKey] : row[key]])).entries()]
                .filter(([key]) => textValue(key))
                .sort((a, b) => String(a[0]).localeCompare(String(b[0]), 'th'));
        }



        function createCarModelMap(rows) {
            return rows.reduce((map, row) => {
                const model = findField(row, ['รุ่นรถยนต์', 'รุ่นรถ', 'Model']);
                const priceGroup = findField(row, ['กลุ่มราคา', 'ประเภทรถยนต์', 'Pro_ID', 'Price Group', 'PriceGroup', 'price_group']);
                if (!model) return map;
                map[normalizeLookupId(model)] = priceGroup || 'ไม่ระบุกลุ่มราคา';
                return map;
            }, {});
        }

        function parseNumber(value) {
            const number = Number(textValue(value).replace(/,/g, ''));
            return Number.isFinite(number) ? number : 0;
        }

        function createCommissionRateMap(rows) {
            return rows.reduce((map, row) => {
                const vehicleType = findField(row, ['ประเภทรถยนต์', 'ประเภทรถ', 'กลุ่มราคา', 'Vehicle Type']);
                if (!vehicleType) return map;
                map[normalizeLookupId(vehicleType)] = {
                    fullRate: parseNumber(findField(row, ['เต็มคัน', 'Full'])),
                    fullSunroofRate: parseNumber(findField(row, ['เต็มคัน + ซันรูฟ', 'เต็มคัน+ซันรูฟ', 'Full + Sunroof']))
                };
                return map;
            }, {});
        }

        function classifyCustomerGroup(customerType) {
            const value = normalizeText(customerType);
            if (!value) return '';
            if (value.includes('claim') || value.includes('problem') || value.includes('warranty')) return '';
            if (value.includes('fix') || value.includes('rework') || value.includes('sameday')) return '';
            if (value.includes('เคลม') || value.includes('ปัญหา') || value.includes('แก้') || value.includes('ในวัน')) return '';
            if (value.includes('เก่า') || value.includes('old') || value.includes('repeat') || value.includes('existing') || value.includes('returning')) return 'ลูกค้าเก่า';
            if (value.includes('ใหม่') || value.includes('new')) return 'ลูกค้าใหม่';
            return '';
        }

        function isCommissionCustomerBooking(booking) {
            const customerType = findField(booking, CUSTOMER_TYPE_FIELDS);
            return CUSTOMER_GROUPS.includes(classifyCustomerGroup(customerType));
        }

        function createBlankPositionCounts() {
            return POSITION_COLUMNS.reduce((result, column) => {
                result[column] = 0;
                return result;
            }, {});
        }

        function addPositionCounts(target, counts) {
            POSITION_COLUMNS.forEach(column => {
                target[column] += counts[column] || 0;
            });
        }

        function getInstallPositionCounts(installType) {
            const posValue = normalizeText(installType);
            const counts = createBlankPositionCounts();

            if (posValue.includes('บานหน้า') || posValue.includes('หน้าเต็ม') || posValue.includes('กระจกหน้า') || posValue.includes('front') || posValue.includes('windshield')) {
                counts['บานหน้า'] += 1;
            }
            if (posValue.includes('บานหลัง') || posValue.includes('กระจกหลัง') || posValue.includes('rear') || posValue.includes('back')) {
                counts['บานหลัง'] += 1;
            }
            if (posValue.includes('ประตูหน้าซ้าย') || (posValue.includes('ประตูหน้า') && posValue.includes('ซ้าย')) || (posValue.includes('ประตู') && posValue.includes('หน้าซ้าย'))) {
                counts['ประตูหน้าซ้าย'] += 1;
            }
            if (posValue.includes('ประตูหน้าขวา') || (posValue.includes('ประตูหน้า') && posValue.includes('ขวา')) || (posValue.includes('ประตู') && posValue.includes('หน้าขวา'))) {
                counts['ประตูหน้าขวา'] += 1;
            }
            if (posValue.includes('ประตูหลังซ้าย') || (posValue.includes('ประตูหลัง') && posValue.includes('ซ้าย')) || (posValue.includes('ประตู') && posValue.includes('หลังซ้าย'))) {
                counts['ประตูหลังซ้าย'] += 1;
            }
            if (posValue.includes('ประตูหลังขวา') || (posValue.includes('ประตูหลัง') && posValue.includes('ขวา')) || (posValue.includes('ประตู') && posValue.includes('หลังขวา'))) {
                counts['ประตูหลังขวา'] += 1;
            }
            if (posValue.includes('ซันรูฟ') || posValue.includes('sunroof')) {
                counts['ซันรูฟ'] += 1;
            }

            return counts;
        }

        function createCommissionRow(monthKey, priceGroup, section, rate) {
            return {
                monthKey,
                monthText: monthLabelFromKey(monthKey),
                priceGroup,
                section,
                rate,
                commission: 0,
                pieceTotal: 0,
                equivalentCars: 0,
                totalUnits: 0,
                ...createBlankPositionCounts()
            };
        }

        function createEmptyCommissionSections() {
            return COMMISSION_SECTIONS.reduce((result, section) => {
                result[section.key] = [];
                return result;
            }, {});
        }

        function buildSummaryRows(bookingRows, carModelRows, commissionRateRows) {
            const carModelMap = createCarModelMap(carModelRows);
            const rateMap = createCommissionRateMap(commissionRateRows);
            const summary = {};

            bookingRows.forEach(booking => {
                const jobId = findField(booking, ['JobID', 'Job ID', 'รหัสงาน']);
                if (!jobId) return;
                const status = findField(booking, ['Status', 'สถานะ']);
                if (isCancelledStatus(status)) return;
                if (!isCommissionCustomerBooking(booking)) return;

                const date = parseDate(findField(booking, ['วันที่ติดตั้ง', 'วันที่', 'Date']));
                const carModel = findField(booking, ['รุ่นรถยนต์', 'รุ่นรถ', 'Model']);
                const installType = findField(booking, [
                    'ตำแหน่งติดตั้ง',
                    'ตำแหน่งติดตั้ง ใหม่',
                    'ตำแหน่งติดตั้งใหม่',
                    'การติดตั้ง',
                    'ประเภทการติดตั้ง',
                    'ตำแหน่ง',
                    'Install Type',
                    'InstallType',
                    'Installation',
                    'Position'
                ]);
                const mappedPriceGroup = carModelMap[normalizeLookupId(carModel)];
                const priceGroup = mappedPriceGroup || (rateMap[normalizeLookupId(carModel)] ? carModel : 'ไม่ระบุกลุ่มราคา');
                const monthKey = monthKeyFromDate(date);
                const rates = rateMap[normalizeLookupId(priceGroup)] || { fullRate: 0, fullSunroofRate: 0 };
                const posValue = normalizeText(installType);
                const isFull = posValue.includes('เต็มคัน') || posValue.includes('รอบคัน') || posValue.includes('ทั้งคัน') || posValue.includes('full') || posValue.includes('whole');
                const isSunroof = posValue.includes('ซันรูฟ') || posValue.includes('sunroof');
                const section = isFull && isSunroof ? 'fullSunroof' : (isFull ? 'full' : 'partial');
                const summaryKey = `${section}||${monthKey}||${priceGroup}`;

                if (!summary[summaryKey]) {
                    const rate = section === 'fullSunroof' ? rates.fullSunroofRate : rates.fullRate;
                    summary[summaryKey] = createCommissionRow(monthKey, priceGroup, section, rate);
                }

                const row = summary[summaryKey];

                if (isFull && isSunroof) {
                    row['ทั้งคัน'] += 1;
                    row['ซันรูฟ'] += 1;
                    row.totalUnits += 1;
                } else if (isFull) {
                    row['ทั้งคัน'] += 1;
                    row.totalUnits += 1;
                } else {
                    const counts = getInstallPositionCounts(installType);
                    addPositionCounts(row, counts);
                    const pieceTotal = POSITION_COLUMNS
                        .filter(column => column !== 'ทั้งคัน')
                        .reduce((sum, column) => sum + counts[column], 0);
                    row.pieceTotal += pieceTotal;
                    row.totalUnits = row.pieceTotal / 6;
                }

                row.equivalentCars = row.section === 'partial' ? row.pieceTotal / 6 : row.totalUnits;
                row.commission = row.equivalentCars * row.rate;
            });

            const sections = createEmptyCommissionSections();
            Object.values(summary).forEach(row => {
                if (sections[row.section]) sections[row.section].push(row);
            });
            Object.values(sections).forEach(rows => rows.sort((a, b) => (
                b.monthKey.localeCompare(a.monthKey) ||
                a.priceGroup.localeCompare(b.priceGroup, 'th')
            )));
            return sections;
        }

        function flattenCommissionRows(sections) {
            if (!sections) return [];
            return COMMISSION_SECTIONS.flatMap(section => sections[section.key] || []);
        }

        function populateMonthFilter() {
            const current = dom.monthFilter.value;
            const months = [...new Map(flattenCommissionRows(allSummaryRows).map(row => [row.monthKey, row.monthText])).entries()]
                .sort((a, b) => b[0].localeCompare(a[0]));
            dom.monthFilter.innerHTML = '<option value="">ทุกรอบ</option>' + months
                .map(([key, label]) => `<option value="${escapeHtml(key)}">${escapeHtml(label)}</option>`)
                .join('');
            
            const now = new Date();
            const currentCalendarMonthKey = monthKeyFromDate(now);
            
            if (current) {
                dom.monthFilter.value = months.some(([key]) => key === current) ? current : '';
            } else {
                const hasCurrentCalendar = months.some(([key]) => key === currentCalendarMonthKey);
                if (hasCurrentCalendar) {
                    dom.monthFilter.value = currentCalendarMonthKey;
                } else if (months.length > 0) {
                    dom.monthFilter.value = months[0][0];
                } else {
                    dom.monthFilter.value = '';
                }
            }
        }

        function filteredRows() {
            return summaryRows;
        }

        function toggleMonthCollapse(monthKey) {
            if (collapsedMonths.has(monthKey)) {
                collapsedMonths.delete(monthKey);
            } else {
                collapsedMonths.add(monthKey);
            }
            renderSummary();
        }
        window.toggleMonthCollapse = toggleMonthCollapse;

        function formatMoney(value) {
            return (Number(value) || 0).toLocaleString('th-TH', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });
        }

        function formatDecimal(value, digits = 2) {
            return (Number(value) || 0).toLocaleString('th-TH', {
                minimumFractionDigits: digits,
                maximumFractionDigits: digits
            });
        }

        function formatCount(value) {
            return (Number(value) || 0) > 0 ? Number(value).toLocaleString('th-TH') : '';
        }

        function renderCommissionHeader(rateLabel) {
            return `
                <th class="text-left font-bold text-white text-xs px-3 py-2 border-r border-white/20 whitespace-nowrap">เดือน</th>
                <th class="text-left font-bold text-white text-xs px-3 py-2 border-r border-white/20 whitespace-nowrap">ประเภทรถ</th>
                ${POSITION_COLUMNS.map(col => `<th class="text-center font-bold text-white text-xs px-3 py-2 border-r border-white/20 whitespace-nowrap">${escapeHtml(col)}</th>`).join('')}
                <th class="text-center font-bold text-white text-xs px-3 py-2 border-r border-white/20 whitespace-nowrap">รวมคัน</th>
                <th class="text-center font-bold text-white text-xs px-3 py-2 border-r border-white/20 whitespace-nowrap">ทั้งหมด (คัน)</th>
                <th class="text-center font-bold text-white text-xs px-3 py-2 border-r border-white/20 whitespace-nowrap">${escapeHtml(rateLabel)}</th>
                <th class="text-center font-bold text-white text-xs px-3 py-2 whitespace-nowrap">ค่าคอม (บาท)</th>
            `;
        }

        function renderSectionRows(section, rows, columnCount) {
            const sectionTotal = summarizeCommissionRows(rows);
            let html = `
                <tr class="commission-section-row ${section.className}">
                    <td colspan="${columnCount}">
                        <div class="flex flex-wrap items-center justify-between gap-2">
                            <span>*${escapeHtml(section.title)}</span>
                            <span>${formatDecimal(sectionTotal.totalUnits)} คัน / ${formatMoney(sectionTotal.commission)} บาท</span>
                        </div>
                    </td>
                </tr>
            `;

            if (!rows.length) {
                return html + `<tr><td colspan="${columnCount}" class="text-center font-semibold text-slate-400">ไม่มีรายการ</td></tr>`;
            }

            let lastMonth = '';
            rows.forEach(row => {
                const monthText = row.monthKey === lastMonth ? '' : row.monthText;
                lastMonth = row.monthKey;
                const sectionMeta = COMMISSION_SECTIONS.find(item => item.key === row.section);
                const totalCarsText = row.section === 'partial' ? formatDecimal(row.pieceTotal / 6, 1) : '';

                html += `
                    <tr class="border-b border-slate-100 bg-white hover:bg-slate-50">
                        <td class="month-cell text-xs font-extrabold text-slate-800 border-r border-slate-200" title="${escapeHtml(monthText)}">${escapeHtml(monthText)}</td>
                        <td class="font-semibold text-slate-700 border-r border-slate-200" title="${escapeHtml(row.priceGroup)}">${escapeHtml(row.priceGroup)}</td>
                        ${POSITION_COLUMNS.map(col => `<td class="text-center border-r border-slate-100">${formatCount(row[col])}</td>`).join('')}
                        <td class="text-center border-r border-slate-100">${totalCarsText}</td>
                        <td class="text-center font-extrabold border-r border-slate-100">${formatDecimal(row.equivalentCars)}</td>
                        <td class="commission-rate-cell text-right border-r border-slate-100" title="${escapeHtml(sectionMeta ? sectionMeta.rateLabel : '')}">${formatMoney(row.rate)}</td>
                        <td class="commission-amount-cell text-right">${formatMoney(row.commission)}</td>
                    </tr>
                `;
            });

            return html;
        }

        function summarizeCommissionRows(rows) {
            return rows.reduce((totals, row) => {
                totals.commission += row.commission || 0;
                totals.totalUnits += row.equivalentCars || 0;
                if (row.section === 'partial') {
                    totals.partialUnits += row.equivalentCars || 0;
                } else {
                    totals.fullUnits += row.totalUnits || 0;
                }
                POSITION_COLUMNS.forEach(column => {
                    totals[column] += row[column] || 0;
                });
                return totals;
            }, {
                commission: 0,
                totalUnits: 0,
                fullUnits: 0,
                partialUnits: 0,
                ...createBlankPositionCounts()
            });
        }

        function renderGrandTotalRow(totals) {
            return `
                <tr class="commission-grand-total border-t-2 border-slate-600">
                    <td>รวมทั้งหมด</td>
                    <td></td>
                    ${POSITION_COLUMNS.map(col => `<td class="text-center">${formatCount(totals[col]) || '-'}</td>`).join('')}
                    <td class="text-center">${formatDecimal(totals.partialUnits, 1)}</td>
                    <td class="text-center">${formatDecimal(totals.totalUnits)}</td>
                    <td></td>
                    <td class="text-right">${formatMoney(totals.commission)}</td>
                </tr>
            `;
        }

        function updateSummaryCards(totals) {
            const values = {
                summaryTotal: formatMoney(totals.commission),
                summaryNew: formatDecimal(totals.totalUnits),
                summaryClaim: formatDecimal(totals.fullUnits),
                summaryFix: formatDecimal(totals.partialUnits)
            };

            Object.entries(values).forEach(([id, value]) => {
                if (dom[id]) dom[id].innerText = value;
            });
        }

        function renderSummary() {
            const sections = filteredRows();
            const allRows = flattenCommissionRows(sections);
            const columnCount = POSITION_COLUMNS.length + 6;

            dom.summaryHead.innerHTML = renderCommissionHeader('เรทค่าคอม/คัน');

            if (!allRows.length) {
                dom.summaryBody.innerHTML = `<tr><td colspan="${columnCount}" class="py-8 text-center font-semibold text-slate-400">ยังไม่มีข้อมูลตามตัวกรองที่เลือก</td></tr>`;
                return;
            }

            let html = '';
            COMMISSION_SECTIONS.forEach(section => {
                const rows = sections[section.key] || [];
                html += renderSectionRows(section, rows, columnCount);
            });

            const totals = summarizeCommissionRows(allRows);
            html += renderGrandTotalRow(totals);
            dom.summaryBody.innerHTML = html;
        }

        function processAndRenderSummary() {
            const filterMode = dom.filterMode.value;
            let filteredBookings = rawBookings;

            if (filterMode === 'month') {
                const month = dom.monthFilter.value;
                if (month) {
                    filteredBookings = rawBookings.filter(b => {
                        const date = parseDate(findField(b, ['วันที่ติดตั้ง', 'วันที่', 'Date']));
                        return monthKeyFromDate(date) === month;
                    });
                }
            } else if (filterMode === 'custom') {
                const start = parseInputDate(dom.startDateInput.value);
                const end = parseInputDate(dom.endDateInput.value);
                filteredBookings = rawBookings.filter(b => {
                    const date = parseDate(findField(b, ['วันที่ติดตั้ง', 'วันที่', 'Date']));
                    if (!date) return false;
                    if (start && date < start) return false;
                    if (end && date > end) return false;
                    return true;
                });
            }

            filteredBookings = filteredBookings.filter(b => {
                const status = findField(b, ['Status', 'สถานะ']);
                return !isCancelledStatus(status);
            });

            const damageBookings = filteredBookings.filter(b => {
                const promotion = findField(b, ['Pro_ID', 'โปรโมชั่น']);
                return normalizeLookupId(promotion) === 'mistake';
            });

            filteredBookings = filteredBookings.filter(isCommissionCustomerBooking);

            let tableBookings = filteredBookings;
            const selectedType = dom.typeFilter.value;
            if (selectedType) {
                tableBookings = filteredBookings.filter(b => {
                    const customerType = findField(b, CUSTOMER_TYPE_FIELDS);
                    return classifyCustomerGroup(customerType) === selectedType;
                });
            }

            summaryRows = buildSummaryRows(tableBookings, rawCarModels, rawCommissionRates);
            updateSummaryCards(summarizeCommissionRows(flattenCommissionRows(summaryRows)));
            renderSummary();
            
            renderDamageSummary(damageBookings);
        }

        function renderDamageSummary(damageBookings) {
            const allDamageRows = typeof DamageCalculator !== 'undefined' 
                ? DamageCalculator.buildDamageRows(damageBookings, rawData, rawInstaller, [], rawCarModels) 
                : [];
            
            let html = '';
            let totalValue = 0;
            
            if (!allDamageRows.length) {
                if (dom.damageSummaryBody) dom.damageSummaryBody.innerHTML = `<tr><td colspan="7" class="py-8 text-center font-semibold text-slate-400">ยังไม่มีข้อมูลความเสียหายตามตัวกรองที่เลือก</td></tr>`;
                return;
            }
            
            allDamageRows.sort((a, b) => {
                const dateA = a.date ? a.date.getTime() : 0;
                const dateB = b.date ? b.date.getTime() : 0;
                return dateA - dateB || String(a.film).localeCompare(String(b.film));
            });
            
            let lastDate = '';
            let lastFilm = '';
            let lastInstaller = '';
            
            allDamageRows.forEach(row => {
                const dateText = row.dateText;
                const isNewDate = dateText !== lastDate;
                if (isNewDate) { lastDate = dateText; lastFilm = ''; lastInstaller = ''; }
                
                const isNewFilm = row.film !== lastFilm;
                if (isNewFilm) { lastFilm = row.film; lastInstaller = ''; }
                
                const isNewInstaller = row.installer !== lastInstaller;
                if (isNewInstaller) { lastInstaller = row.installer; }
                
                const dashIcon = `<div class="h-3.5 w-3.5 rounded-sm bg-slate-400 flex items-center justify-center text-white font-black leading-none text-[10px]">-</div>`;
                const displayDate = isNewDate ? `<span class="inline-flex items-center gap-1.5">${dashIcon}${escapeHtml(dateText)}</span>` : '';
                const displayFilm = isNewFilm ? `<span class="inline-flex items-center gap-1.5">${dashIcon}${escapeHtml(row.film)}</span>` : '';
                const displayInstaller = isNewInstaller ? `<span class="inline-flex items-center gap-1.5">${dashIcon}${escapeHtml(row.installer)}</span>` : '';
                
                const costKey = String(row.film).replace(/[\s._\-–—/\\]+/g, '').toLowerCase();
                const cost = filmCostMap[costKey] || 0;
                const sqf = row.sqf || 0;
                const damageVal = cost * sqf;
                totalValue += damageVal;
                
                html += `
                    <tr class="border-b border-slate-100 bg-white hover:bg-slate-50">
                        <td class="font-semibold text-slate-700 border-r border-slate-200 py-2 px-3">${displayDate}</td>
                        <td class="text-slate-700 border-r border-slate-200 py-2 px-3">${displayFilm}</td>
                        <td class="text-slate-700 border-r border-slate-200 py-2 px-3">${displayInstaller}</td>
                        <td class="text-slate-700 border-r border-slate-200 py-2 px-3">${escapeHtml(row.position)}</td>
                        <td class="text-right border-r border-slate-100 py-2 px-3">${sqf ? sqf.toLocaleString('th-TH', { maximumFractionDigits: 2 }) : '-'}</td>
                        <td class="text-right border-r border-slate-100 py-2 px-3">${cost ? cost.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</td>
                        <td class="text-right font-semibold text-rose-600 py-2 px-3">${damageVal ? damageVal.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</td>
                    </tr>
                `;
            });
            
            html += `
                <tr class="commission-grand-total border-t-2 border-slate-600">
                    <td colspan="6" class="text-right">รวมทั้งหมด</td>
                    <td class="text-right text-rose-400">${totalValue ? totalValue.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</td>
                </tr>
            `;
            
            if (dom.damageSummaryBody) dom.damageSummaryBody.innerHTML = html;
        }

        async function fetchInstallerCsv() {
            for (const url of INSTALLER_CSV_URLS) {
                try {
                    const text = await fetchCsvText(url);
                    if (text) return text;
                } catch (e) { }
            }
            return null;
        }

        async function fetchSummaryData() {
            dom.loadingMessage.classList.remove('hidden');
            dom.errorMessage.classList.add('hidden');
            dom.tableWrap.classList.add('hidden');
            if (dom.damageLoadingMessage) dom.damageLoadingMessage.classList.remove('hidden');
            if (dom.damageTableWrap) dom.damageTableWrap.classList.add('hidden');
            dom.connectionStatus.innerText = 'กำลังโหลดข้อมูลจาก Google Sheets...';

            try {
                const bookingText = await fetchCsvText(BOOKINGS_CSV_URL).catch(() => null);
                const carModelText = await fetchCsvText(CAR_MODEL_CSV_URL).catch(() => null);
                const commissionRateText = await fetchCsvText(COMMISSION_RATE_CSV_URL).catch(() => null);
                
                if (!bookingText || !carModelText || !commissionRateText) {
                    throw new Error('ไม่สามารถโหลดข้อมูลหลักได้ครบถ้วน');
                }

                const dataText = await fetchCsvText(DATA_CSV_URL).catch(() => null);
                const filmCostText = await fetchCsvText(FILM_COST_CSV_URL).catch(() => null);
                const installerText = await fetchInstallerCsv();

                const bookingRows = bookingText ? await parseCsv(bookingText) : [];
                const carModelRows = carModelText ? await parseCsv(carModelText) : [];
                const commissionRateRows = commissionRateText ? await parseCsv(commissionRateText) : [];
                const dataRows = dataText ? await parseCsv(dataText) : [];
                const filmCostRows = filmCostText ? await parseCsv(filmCostText) : [];
                const installerRows = installerText ? await parseCsv(installerText) : [];

                rawBookings = bookingRows;
                rawCarModels = carModelRows;
                rawCommissionRates = commissionRateRows;
                rawData = dataRows;
                rawInstaller = installerRows;
                
                filmCostMap = {};
                filmCostRows.forEach(row => {
                    const vals = Object.values(row);
                    if (vals.length >= 2) {
                        const film = vals[0];
                        const costText = String(vals[1]).replace(/[^\d.-]/g, '');
                        const cost = parseFloat(costText);
                        if (film && cost > 0) {
                            filmCostMap[String(film).replace(/[\s._\-–—/\\]+/g, '').toLowerCase()] = cost;
                        }
                    }
                });

                allSummaryRows = buildSummaryRows(rawBookings, rawCarModels, rawCommissionRates);

                populateMonthFilter();
                processAndRenderSummary();

                dom.loadingMessage.classList.add('hidden');
                dom.tableWrap.classList.remove('hidden');
                if (dom.damageLoadingMessage) dom.damageLoadingMessage.classList.add('hidden');
                if (dom.damageTableWrap) dom.damageTableWrap.classList.remove('hidden');
                dom.lastUpdated.innerText = `อัปเดตล่าสุด: ${new Date().toLocaleTimeString('th-TH', { hour: 'numeric', minute: '2-digit', hour12: false })} น.`;
                dom.connectionStatus.innerText = 'เชื่อมต่อข้อมูลสดเรียบร้อย';
            } catch (error) {
                console.error(error);
                dom.loadingMessage.classList.add('hidden');
                dom.errorMessage.classList.remove('hidden');
                dom.connectionStatus.innerText = 'โหลดข้อมูลไม่สำเร็จ';
            }
        }

        function initApp() {
            cacheDom();
            
            dom.filterMode.addEventListener('change', () => {
                const isCustom = dom.filterMode.value === 'custom';
                dom.monthFilterContainer.classList.toggle('hidden', isCustom);
                dom.customDateContainer.classList.toggle('hidden', !isCustom);
                processAndRenderSummary();
            });
            
            dom.monthFilter.addEventListener('change', () => processAndRenderSummary());
            dom.startDateInput.addEventListener('change', () => processAndRenderSummary());
            dom.endDateInput.addEventListener('change', () => processAndRenderSummary());
            dom.typeFilter.addEventListener('change', () => processAndRenderSummary());

            fetchSummaryData();
        }

        function startAppOnce() {
            if (appHasStarted) return;
            appHasStarted = true;
            initApp();
        }

        async function requestCommissionAccess() {
            if (sessionStorage.getItem(COMMISSION_ACCESS_KEY) === '1') return true;

            const granted = await window.CarCrmCommissionAuth.request({
                password: COMMISSION_PASS,
                title: 'คำนวณค่าคอมช่าง',
                message: 'ใส่รหัสผ่านเพื่อเข้าสู่หน้าคำนวณค่าคอมช่าง',
                confirmText: 'เข้าสู่หน้า',
                cancelText: 'กลับ'
            });

            if (granted) {
                sessionStorage.setItem(COMMISSION_ACCESS_KEY, '1');
                return true;
            }

            window.location.href = 'install-summary.html';
            return false;
        }

        async function unlockPage() {
            if (!await requestCommissionAccess()) return;
            document.body.classList.remove('auth-locked');
            startAppOnce();
        }

        function setupLogin() {
            cacheDom();
            const stored = localStorage.getItem(LOGIN_KEY);
            if (stored === '1' || stored === 'yes') {
                localStorage.setItem(LOGIN_KEY, '1');
                unlockPage();
                return;
            }

            dom.loginForm.addEventListener('submit', event => {
                event.preventDefault();
                const user = dom.loginUser.value.trim();
                const pass = dom.loginPass.value;
                if (user === LOGIN_USER && pass === LOGIN_PASS) {
                    localStorage.setItem(LOGIN_KEY, '1');
                    dom.loginError.classList.add('hidden');
                    unlockPage();
                    return;
                }

                dom.loginError.classList.remove('hidden');
                dom.loginPass.select();
            });
        }

        document.addEventListener('DOMContentLoaded', setupLogin);
    