// training_tracker.js (Spreadsheet Mode)

document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('spreadsheet-body');
    const API_URL = 'api/training_tracker.php';
    let records = [];

    // Initialize
    let localFileHandle = null;

    fetchRecords().then(() => {
        // Initial sync to server master
        syncToExcel(true);
    });
    setupModal();
    setupInstructorModal();
    setupExport();

    let syncTimeout;
    const SYNC_DELAY = 1000; // 1 second debounce for cell changes

    // ----------------------------------------------------
    // API & Data Fetching
    // ----------------------------------------------------
    // ... (rest of fetchRecords)

    // ----------------------------------------------------
    // Excel Generation & Sync Logic
    // ----------------------------------------------------
    async function generateExcelWorkbook() {
        // 0. Fetch latest records before generation to ensure no stale data
        try {
            const refreshRes = await fetch(API_URL);
            const refreshResult = await refreshRes.json();
            if (refreshResult.success) {
                records = refreshResult.data || [];
            }
        } catch (err) {
            console.error('Pre-export refresh failed', err);
        }

        if (records.length === 0) {
            return null;
        }

        // 1. Create Workbook and Worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Training Tracker');

        // 2. Define Headers with Icons
        const headerData = [
            { header: '📅 Start Date', key: 'start_date', width: 15 },
            { header: '📅 End Date', key: 'end_date', width: 15 },
            { header: '🔘 Type', key: 'type', width: 15 },
            { header: '🔤 Host Office', key: 'host_office', width: 25 },
            { header: '🔤 Activity', key: 'activity', width: 45 },
            { header: '👥 Instructor / Participants', key: 'participants', width: 45 },
            { header: '🔢 Pax', key: 'pax', width: 10 },
            { header: '📍 Venue', key: 'venue', width: 25 },
            { header: '🔘 Status', key: 'status', width: 15 },
            { header: '📝 Update 1', key: 'up1', width: 20 },
            { header: '📝 Update 2', key: 'up2', width: 20 },
            { header: '📝 Update 3', key: 'up3', width: 20 },
            { header: '🔗 Documentations', key: 'docs', width: 20 },
            { header: '📊 Reports', key: 'reports', width: 20 }
        ];

        worksheet.columns = headerData;

        // 3. Add Data
        records.forEach(r => {
            worksheet.addRow({
                start_date: r.start_date || '',
                end_date: r.end_date || '',
                type: r.type_of_activity || '',
                host_office: r.host_office || '',
                activity: r.activity || '',
                participants: r.instructor_participants || '',
                pax: r.no_of_pax || 0,
                venue: r.venue || '',
                status: r.status || '',
                up1: r.status_update_1 || '',
                up2: r.status_update_2 || '',
                up3: r.status_update_3 || '',
                docs: r.documentations || '',
                reports: r.reports || ''
            });
        });

        // 4. Style Header Row (Maroon background, White bold text)
        const headerRow = worksheet.getRow(1);
        headerRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF8B0000' } // Maroon
            };
            cell.font = {
                color: { argb: 'FFFFFFFF' }, // White
                bold: true,
                size: 11
            };
            cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
            cell.border = {
                top: { style: 'thin', color: { argb: 'FFA32A2A' } },
                left: { style: 'thin', color: { argb: 'FFA32A2A' } },
                bottom: { style: 'thin', color: { argb: 'FFA32A2A' } },
                right: { style: 'thin', color: { argb: 'FFA32A2A' } }
            };
        });
        headerRow.height = 30;

        // 5. Style Data Rows (Borders and alignment)
        worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Skip header

            row.eachCell((cell, colNumber) => {
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFD4D4D4' } },
                    left: { style: 'thin', color: { argb: 'FFD4D4D4' } },
                    bottom: { style: 'thin', color: { argb: 'FFD4D4D4' } },
                    right: { style: 'thin', color: { argb: 'FFD4D4D4' } }
                };
                cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };

                // Center Pax and Type columns
                if (colNumber === 7 || colNumber === 3) {
                    cell.alignment.horizontal = 'center';
                }

                // Format Instructor / Participants (Col 6) with numbering if multiple
                if (colNumber === 6) {
                    const val = cell.value ? cell.value.toString() : '';
                    // Split by comma OR any newline sequence
                    if (val.includes(',') || val.includes('\n') || val.includes('\r')) {
                        const names = val.split(/[,\n\r]+/).map(n => n.trim()).filter(n => n);
                        if (names.length > 1) {
                            // Change from bullet to sequential numbering
                            cell.value = names.map((n, index) => `${index + 1}. ${n}`).join('\n');
                            cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
                        }
                    }
                }

                // Style Documentations (Col 13) and Reports (Col 14) as Pills
                if (colNumber === 13 || colNumber === 14) {
                    const val = cell.value ? cell.value.toString() : '';
                    if (val) {
                        // Add icons: 📁 for Docs, 📝 for Reports
                        if (cell.column === 13 && !val.includes('📁')) {
                            cell.value = '📁 ' + val;
                        } else if (cell.column === 14 && !val.includes('📝')) {
                            cell.value = '📝 ' + val;
                        }

                        // Background for "pill" effect
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFF0F2F5' }
                        };

                        // Font styling
                        cell.font = { color: { argb: 'FF000000' }, size: 10 };

                        if (val.includes('http')) {
                            cell.font.color = { argb: 'FF0000FF' };
                            cell.font.underline = true;
                        }

                        cell.alignment = {
                            vertical: 'middle',
                            horizontal: 'left',
                            indent: 1,
                            wrapText: false
                        };
                    }
                }
            });
        });

        // 6. Data Validation (Dropdowns for Type and Status)
        // Type of Activity dropdown (Col 3)
        const typeDropdown = ['Invitational', 'Host', 'Participant', 'All'];
        worksheet.getColumn(3).eachCell((cell, rowNumber) => {
            if (rowNumber > 1) {
                cell.dataValidation = {
                    type: 'list',
                    allowBlank: true,
                    formulae: [`"${typeDropdown.join(',')}"`],
                    showErrorMessage: true,
                    errorTitle: 'Invalid Selection',
                    error: 'Please select from the list.'
                };
            }
        });

        // Status dropdown (Col 9)
        const statusDropdown = ['Implemented', 'In progress', 'Under review', 'Suspended', 'Paused'];
        worksheet.getColumn(9).eachCell((cell, rowNumber) => {
            if (rowNumber > 1) {
                cell.dataValidation = {
                    type: 'list',
                    allowBlank: true,
                    formulae: [`"${statusDropdown.join(',')}"`],
                    showErrorMessage: true,
                    errorTitle: 'Invalid Status',
                    error: 'Please select a valid status.'
                };
            }
        });

        return workbook;
    }

    async function syncToExcel(silent = true) {
        if (!silent) showToast('Syncing to Excel...', 'success', true);

        try {
            const workbook = await generateExcelWorkbook();
            if (!workbook) return;

            const buffer = await workbook.xlsx.writeBuffer();

            // 1. Sync to Server Master File (Background)
            try {
                fetch('api/sync_excel.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/octet-stream' },
                    body: buffer
                });
            } catch (err) {
                console.error('Server sync failed', err);
            }

            // 2. Sync to Local File (If connected)
            if (localFileHandle) {
                try {
                    // Check if we still have permission
                    const options = { mode: 'readwrite' };
                    if (await localFileHandle.queryPermission(options) === 'granted') {
                        const writable = await localFileHandle.createWritable();
                        await writable.write(buffer);
                        await writable.close();
                        console.log('Local file direct-synced');
                        if (!silent) showToast('Excel Synced Locally!', 'success', true);
                    }
                } catch (err) {
                    console.error('Local file sync failed', err);
                    localFileHandle = null; // Clear if it fails or permission revoked
                    if (typeof updateSyncUI === 'function') updateSyncUI();
                }
            }

            if (!silent && !localFileHandle) {
                showToast('Server Excel Updated!', 'success', true);
            }
        } catch (error) {
            console.error('Excel Sync Failed:', error);
        }
    }

    function updateSyncUI() {
        const btn = document.getElementById('btn-export-excel');
        if (!btn) return;

        if (localFileHandle) {
            btn.innerHTML = '<span>🟢</span> Excel Connected';
            btn.style.borderColor = '#2ecc71';
            btn.style.background = 'rgba(46, 204, 113, 0.1)';
            btn.style.color = '#2ecc71';
            btn.title = 'Changes are now directly saved to your local file.';
        } else {
            const isSupported = !!window.showSaveFilePicker;
            btn.innerHTML = isSupported ? '<span>📊</span> Connect Local Excel' : '<span>📊</span> Download Excel';
            btn.style.borderColor = isSupported ? '#64ffda' : '#ffb74d';
            btn.style.background = isSupported ? 'rgba(100, 255, 218, 0.15)' : 'rgba(255, 183, 77, 0.15)';
            btn.style.color = isSupported ? '#64ffda' : '#ffb74d';
            btn.title = isSupported ? 'Click to pick a local file for automatic real-time sync' : 'Direct sync not supported in this browser. Will download new files.';
        }
    }

    function setupExport() {
        const btnExport = document.getElementById('btn-export-excel');
        if (!btnExport) return;

        // Run UI update initially
        updateSyncUI();

        btnExport.addEventListener('click', async () => {
            // 1. Check if browser supports File System Access API
            if (!window.showSaveFilePicker) {
                console.warn('File System Access API not supported');
                const masterFileUrl = `Training_Tracker.xlsx?t=${new Date().getTime()}`;

                await syncToExcel(true);

                const link = document.createElement('a');
                link.href = masterFileUrl;
                link.download = 'Training_Tracker.xlsx';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                showToast('Automatic sync not supported in this browser. Downloading file...', 'warning');
                return;
            }

            // 2. If not connected, connect
            if (!localFileHandle) {
                try {
                    showToast('Please select your master Excel file...', 'info');
                    localFileHandle = await window.showSaveFilePicker({
                        suggestedName: 'Training_Tracker.xlsx',
                        types: [{
                            description: 'Excel Workbook',
                            accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] }
                        }]
                    });

                    updateSyncUI();
                    showToast('Connection Established! Saving will be automatic.', 'success');
                    await syncToExcel(false);
                } catch (err) {
                    console.log('User cancelled file picker or it failed', err);
                    if (err.name !== 'AbortError') {
                        showToast('Failed to connect local file: ' + err.message, 'error');
                    }
                }
            } else {
                // 3. If already connected, manual sync
                await syncToExcel(false);
            }
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
                    await fetchRecords(); // Refresh local table
                    syncToExcel(true); // Sync to server Excel
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
                <td class="instructor-cell">
                    <div class="name-pills-container">
                        ${(record.instructor_participants || '').split(',').map(name => name.trim()).filter(name => name).map(name => `<span class="name-pill">${name}</span>`).join('')}
                    </div>
                    <textarea name="instructor_participants" rows="2">${safeVal(record.instructor_participants)}</textarea>
                    <button class="btn-view-instructors" onclick="openInstructorModal(this)" title="View/Edit Names">👁</button>
                </td>
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
                    <div class="cell-link-container ${docsVal ? 'has-content' : ''}">
                        ${docsVal && isUrl(docsVal)
                ? `<a href="${docsVal}" target="_blank" class="cell-icon-link" title="Open Link">📁</a>`
                : `<span class="cell-icon">📁</span>`}
                        <input type="text" name="documentations" value="${docsVal}" placeholder="Link or text">
                        ${docsVal && isUrl(docsVal) ? `<a href="${docsVal}" target="_blank" class="cell-link-icon" title="Open Link">🔗</a>` : ''}
                    </div>
                </td>
                <td>
                    <div class="cell-link-container ${reportsVal ? 'has-content' : ''}">
                        ${reportsVal && isUrl(reportsVal)
                ? `<a href="${reportsVal}" target="_blank" class="cell-icon-link" title="Open Link">📝</a>`
                : `<span class="cell-icon">📝</span>`}
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
            const val = input.value;
            const isLink = val && (val.startsWith('http://') || val.startsWith('https://'));

            // Clean up existing elements
            const existingLink = container.querySelector('.cell-link-icon');
            if (existingLink) existingLink.remove();

            // Handle Icon (Wrapper for Link or Span)
            const iconChar = input.name === 'documentations' ? '📁' : '📝';
            let iconElement = container.querySelector('.cell-icon, .cell-icon-link');
            if (iconElement) {
                // Remove the old one to rebuild
                iconElement.remove();
            }

            // Create new icon element
            if (isLink) {
                const link = document.createElement('a');
                link.href = val;
                link.target = '_blank';
                link.className = 'cell-icon-link';
                link.title = 'Open Link';
                link.innerText = iconChar;
                container.prepend(link);
            } else {
                const span = document.createElement('span');
                span.className = 'cell-icon';
                span.innerText = iconChar;
                container.prepend(span);
            }

            // Toggle has-content class for pill styling
            if (val) {
                container.classList.add('has-content');
            } else {
                container.classList.remove('has-content');
            }

            // Add back the standard 🔗 icon if it's a link (though CSS will hide it if it's in a pill)
            if (isLink) {
                const linkIcon = document.createElement('a');
                linkIcon.href = val;
                linkIcon.target = '_blank';
                linkIcon.className = 'cell-link-icon';
                linkIcon.title = 'Open Link';
                linkIcon.innerText = '🔗';
                container.appendChild(linkIcon);
            }
        }

        // Handle name pills for Instructor / Participants
        if (input.name === 'instructor_participants' || input.name === 'instructor_participants[]') {
            const container = row.querySelector('.name-pills-container');
            if (container) {
                const names = input.value.split(',').map(n => n.trim()).filter(n => n);
                container.innerHTML = names.map(n => `<span class="name-pill">${n}</span>`).join('');
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
                    syncToExcel(true); // Sync to server Excel
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

                    // Sync to Excel with debounce
                    clearTimeout(syncTimeout);
                    syncTimeout = setTimeout(() => syncToExcel(true), SYNC_DELAY);
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
                syncToExcel(true); // Sync to server Excel
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

    // ----------------------------------------------------
    // Instructor View Modal Logic
    // ----------------------------------------------------
    let currentInstructorRow = null;
    let currentInstructorInput = null;

    function setupInstructorModal() {
        const modal = document.getElementById('instructor-view-modal');
        const btnClose = document.getElementById('btn-close-instructor-modal');
        const btnCancel = document.getElementById('btn-cancel-instructor-modal');
        const btnSave = document.getElementById('btn-save-instructor-modal');
        const textarea = document.getElementById('modal-instructor-textarea');

        const closeModal = () => modal.classList.remove('active');

        btnClose.onclick = closeModal;
        btnCancel.onclick = closeModal;

        btnSave.onclick = async () => {
            if (currentInstructorInput && currentInstructorRow) {
                currentInstructorInput.value = textarea.value;
                // Trigger change to save to DB and update pills
                handleCellChange(currentInstructorInput, currentInstructorRow);
                closeModal();
            }
        };

        // Expose openInstructorModal to window
        window.openInstructorModal = (btn) => {
            currentInstructorRow = btn.closest('tr');
            currentInstructorInput = currentInstructorRow.querySelector('textarea[name="instructor_participants"]');
            textarea.value = currentInstructorInput.value;
            modal.classList.add('active');
            setTimeout(() => textarea.focus(), 100);
        };
    }
});
