// training_tracker.js (Spreadsheet Mode)

document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('spreadsheet-body');
    const API_URL = 'api/training_tracker.php';
    let records = [];

    // Initialize
    fetchRecords();
    setupModal();
    setupExport();

    // ----------------------------------------------------
    // API & Data Fetching
    // ----------------------------------------------------
    // ... (rest of fetchRecords)

    // ----------------------------------------------------
    // Export to Excel (CSV) logic
    // ----------------------------------------------------
    function setupExport() {
        const btnExport = document.getElementById('btn-export-excel');
        if (!btnExport) return;

        btnExport.addEventListener('click', () => {
            if (records.length === 0) {
                showToast('No data to export', 'error');
                return;
            }

            // 1. Prepare Data for SheetJS
            const headers = [
                'Start Date', 'End Date', 'Type', 'Host Office', 'Activity',
                'Instructor/Participants', 'Pax', 'Venue', 'Status',
                'Status Update 1', 'Status Update 2', 'Status Update 3',
                'Documentations', 'Reports'
            ];

            const excelData = records.map(r => [
                r.start_date || '',
                r.end_date || '',
                r.type_of_activity || '',
                r.host_office || '',
                r.activity || '',
                r.instructor_participants || '',
                r.no_of_pax || 0,
                r.venue || '',
                r.status || '',
                r.status_update_1 || '',
                r.status_update_2 || '',
                r.status_update_3 || '',
                r.documentations || '',
                r.reports || ''
            ]);

            // Combine headers and data
            const finalData = [headers, ...excelData];

            // 2. Create Workbook and Worksheet
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(finalData);

            // 3. Simple Styling (Column Widths)
            const wscols = headers.map(() => ({ wch: 20 })); // Set default column width to 20
            wscols[4] = { wch: 40 }; // Activity column wider
            wscols[5] = { wch: 40 }; // Participants column wider
            ws['!cols'] = wscols;

            // 4. Append and Save
            XLSX.utils.book_append_sheet(wb, ws, "Training Tracker");
            XLSX.writeFile(wb, `Training_Tracker_${new Date().toISOString().split('T')[0]}.xlsx`);

            showToast('Professional Excel Exported!', 'success');
        });
    }

    // ----------------------------------------------------
    async function fetchRecords() {
        try {
            const response = await fetch(API_URL);
            const result = await response.json();

            if (result.success) {
                records = result.data || [];
                renderTable();
            } else {
                showToast('Failed to fetch records: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error fetching records:', error);
            showToast('Network error while fetching records.', 'error');
        }
    }

    // ----------------------------------------------------
    // Modal Logic
    // ----------------------------------------------------
    function setupModal() {
        const modal = document.getElementById('add-event-modal');
        const btnOpen = document.getElementById('btn-add-event');
        const btnClose = document.getElementById('btn-close-modal');
        const btnCancel = document.getElementById('btn-cancel-modal');
        const form = document.getElementById('add-event-form');

        const closeModal = () => modal.classList.remove('active');
        const openModal = () => {
            form.reset();
            modal.classList.add('active');
        };

        btnOpen.addEventListener('click', openModal);
        btnClose.addEventListener('click', closeModal);
        btnCancel.addEventListener('click', closeModal);

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const payload = Object.fromEntries(formData.entries());

            // Convert pax to integer
            payload.no_of_pax = parseInt(payload.no_of_pax) || 0;

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await response.json();

                if (result.success) {
                    showToast('Event added successfully!', 'success');
                    closeModal();
                    fetchRecords(); // Refresh table
                } else {
                    showToast('Failed to add event: ' + result.error, 'error');
                }
            } catch (error) {
                showToast('Network error while adding event.', 'error');
            }
        });
    }

    // ----------------------------------------------------
    // Rendering the Table
    // ----------------------------------------------------
    function renderTable() {
        let html = '';

        // Render existing rows
        records.forEach(record => {
            html += generateRowHTML(record, false);
        });

        tableBody.innerHTML = html;
        attachRowListeners();
    }

    function generateRowHTML(record, isNew) {
        const id = isNew ? '' : record.id;
        const rowClass = isNew ? 'new-entry-row' : 'data-row';

        // Escape quotes to prevent breaking HTML inputs
        const safeVal = (val) => val ? val.toString().replace(/"/g, '&quot;') : '';

        const typeValue = record.type_of_activity || '';
        const statusValue = record.status || '';

        const docsVal = safeVal(record.documentations);
        const reportsVal = safeVal(record.reports);

        const isUrl = (val) => val && (val.startsWith('http://') || val.startsWith('https://'));

        return `
            <tr class="${rowClass}" data-id="${id}">
                <td style="text-align: center;">
                    ${!isNew ? `<button class="row-action-btn" onclick="deleteRow(${id})" title="Delete Row">✖</button>` : ''}
                </td>
                <td><input type="date" name="start_date" value="${safeVal(record.start_date)}"></td>
                <td><input type="date" name="end_date" value="${safeVal(record.end_date)}"></td>
                <td>
                    <select name="type_of_activity" class="pill-select" data-value="${typeValue}">
                        <option value=""></option>
                        <option value="Invitational" ${typeValue === 'Invitational' ? 'selected' : ''}>Invitational</option>
                        <option value="Host" ${typeValue === 'Host' ? 'selected' : ''}>Host</option>
                        <option value="Participant" ${typeValue === 'Participant' ? 'selected' : ''}>Participant</option>
                        <option value="All" ${typeValue === 'All' ? 'selected' : ''}>All</option>
                    </select>
                </td>
                <td><input type="text" name="host_office" value="${safeVal(record.host_office)}"></td>
                <td><input type="text" name="activity" value="${safeVal(record.activity)}"></td>
                <td><textarea name="instructor_participants" rows="2">${safeVal(record.instructor_participants)}</textarea></td>
                <td><input type="number" name="no_of_pax" value="${record.no_of_pax || ''}" style="text-align: right;"></td>
                <td><input type="text" name="venue" value="${safeVal(record.venue)}"></td>
                <td>
                    <select name="status" class="pill-select" data-value="${statusValue}">
                        <option value=""></option>
                        <option value="Implemented" ${statusValue === 'Implemented' ? 'selected' : ''}>Implemented</option>
                        <option value="In progress" ${statusValue === 'In progress' ? 'selected' : ''}>In progress</option>
                        <option value="Under review" ${statusValue === 'Under review' ? 'selected' : ''}>Under review</option>
                        <option value="Suspended" ${statusValue === 'Suspended' ? 'selected' : ''}>Suspended</option>
                        <option value="Paused" ${statusValue === 'Paused' ? 'selected' : ''}>Paused</option>
                    </select>
                </td>
                <td><input type="text" name="status_update_1" value="${safeVal(record.status_update_1)}"></td>
                <td><input type="text" name="status_update_2" value="${safeVal(record.status_update_2)}"></td>
                <td><input type="text" name="status_update_3" value="${safeVal(record.status_update_3)}"></td>
                <td>
                    <div class="cell-link-container">
                        <input type="text" name="documentations" value="${docsVal}" placeholder="Link or text">
                        ${docsVal && isUrl(docsVal) ? `<a href="${docsVal}" target="_blank" class="cell-link-icon" title="Open Link">🔗</a>` : ''}
                    </div>
                </td>
                <td>
                    <div class="cell-link-container">
                        <input type="text" name="reports" value="${reportsVal}" placeholder="Link or text">
                        ${reportsVal && isUrl(reportsVal) ? `<a href="${reportsVal}" target="_blank" class="cell-link-icon" title="Open Link">🔗</a>` : ''}
                    </div>
                </td>
            </tr>
        `;
    }

    // ----------------------------------------------------
    // Auto-Save Logic (Inline Editing)
    // ----------------------------------------------------
    function attachRowListeners() {
        const rows = document.querySelectorAll('#spreadsheet-body tr');

        rows.forEach(row => {
            const inputs = row.querySelectorAll('input, select, textarea');

            inputs.forEach(input => {
                input.addEventListener('change', (e) => handleCellChange(e.target, row));
                input.addEventListener('blur', (e) => handleCellBlur(e.target, row));
            });
        });
    }

    const originalValues = new Map();

    function handleCellBlur(input, row) {
        if (!input.dataset.tracked) {
            input.dataset.tracked = 'true';
            originalValues.set(input, input.value);

            input.addEventListener('focus', () => {
                originalValues.set(input, input.value);
            }, { once: true });
        }
    }

    async function handleCellChange(input, row) {
        // Update data-value attribute for selects to trigger CSS color changes
        if (input.tagName === 'SELECT') {
            input.setAttribute('data-value', input.value);
        }

        // Handle link icons for Documentations and Reports
        if (input.name === 'documentations' || input.name === 'reports') {
            const container = input.parentElement;
            const existingLink = container.querySelector('.cell-link-icon');
            if (existingLink) existingLink.remove();

            const val = input.value;
            if (val && (val.startsWith('http://') || val.startsWith('https://'))) {
                const link = document.createElement('a');
                link.href = val;
                link.target = '_blank';
                link.className = 'cell-link-icon';
                link.title = 'Open Link';
                link.innerText = '🔗';
                container.appendChild(link);
            }
        }

        const id = row.getAttribute('data-id');
        const isNewRow = !id;
        const payload = extractRowData(row);

        if (isNewRow && !payload.activity && !payload.start_date && !payload.host_office) {
            return;
        }

        row.style.opacity = '0.5';

        if (isNewRow) {
            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await response.json();
                if (result.success) {
                    row.setAttribute('data-id', result.id);
                    row.classList.remove('new-entry-row');
                    row.classList.add('data-row');
                    row.querySelector('td:first-child').innerHTML = `<button class="row-action-btn" onclick="deleteRow(${result.id})" title="Delete Row">✖</button>`;
                    showToast('Row added', 'success', true);
                }
            } catch (err) {
                showToast('Failed to add row', 'error');
            }
        } else {
            payload.id = id;
            try {
                const response = await fetch(API_URL, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                const result = await response.json();
                if (result.success) {
                    showToast('Saved', 'success', true);
                }
            } catch (err) {
                showToast('Update failed', 'error');
            }
        }

        row.style.opacity = '1';
        originalValues.set(input, input.value);
    }

    function extractRowData(row) {
        const data = {};
        const inputs = row.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            if (input.name) {
                data[input.name] = input.value;
            }
        });

        data.no_of_pax = data.no_of_pax ? parseInt(data.no_of_pax) : 0;
        return data;
    }

    window.deleteRow = async function (id) {
        if (!confirm('Delete this row completely?')) return;

        try {
            const response = await fetch(`${API_URL}?id=${id}`, { method: 'DELETE' });
            const result = await response.json();

            if (result.success) {
                const row = document.querySelector(`tr[data-id="${id}"]`);
                if (row) row.remove();
                showToast('Row deleted', 'success', true);
            } else {
                showToast('Failed to delete', 'error');
            }
        } catch (error) {
            showToast('Delete error', 'error');
        }
    };

    let toastTimeout;
    function showToast(message, type = 'success', small = false) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        if (small) container.innerHTML = '';

        const toast = document.createElement('div');
        toast.style.background = type === 'success' ? '#2ecc71' : '#e74c3c';
        toast.style.color = '#fff';
        toast.style.padding = small ? '6px 12px' : '12px 20px';
        toast.style.borderRadius = '4px';
        toast.style.marginBottom = '5px';
        toast.style.fontSize = small ? '12px' : '14px';
        toast.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        toast.style.transition = 'opacity 0.2s';

        toast.innerText = message;
        container.appendChild(toast);

        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 200);
        }, small ? 1500 : 3000);
    }
});
