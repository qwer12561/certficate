import re

with open('c:\\xampp\\htdocs\\breti\\training_tracker.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Variables and setup
js = js.replace("let records = [];", "let records = [];\n    let receivedRecords = [];\n    const lettersTableBody = document.getElementById('letters-body');\n    const RECEIVED_API_URL = 'api/received_letters.php';\n    let activeTab = 'tracker';")

js = js.replace("""    fetchRecords().then(() => {
        // Initial sync to server master
        syncToExcel(true);
    });""", """    fetchRecords().then(() => {
        fetchReceivedRecords().then(() => {
            syncToExcel(true);
        });
    });""")

js = js.replace("    setupModal();", "    setupModal();\n    setupTabs();")

# 2. Excel Generator refresh
refresh_block = """            const refreshRes = await fetch(API_URL);
            const refreshResult = await refreshRes.json();
            if (refreshResult.success) {
                records = refreshResult.data || [];
            }"""
refresh_block_new = refresh_block + """
            const refreshRes2 = await fetch(RECEIVED_API_URL);
            const refreshResult2 = await refreshRes2.json();
            if (refreshResult2.success) {
                receivedRecords = refreshResult2.data || [];
            }"""
js = js.replace(refresh_block, refresh_block_new)

# 3. Populate lettersWorksheet
populate_block_orig = """        lettersHeaderRow.height = 30;

        // 5. Style Data Rows (Borders and alignment)"""
populate_block_new = """        lettersHeaderRow.height = 30;

        receivedRecords.forEach(r => {
            lettersWorksheet.addRow({
                received_date: r.received_date || '',
                date_of_activity: r.date_of_activity || '',
                type_of_activity: r.type_of_activity || '',
                host_office: r.host_office || '',
                activity: r.activity || '',
                instructor_participants: r.instructor_participants || '',
                no_of_pax: r.no_of_pax || 0,
                venue: r.venue || '',
                status: r.status || '',
                actioned_communication: r.actioned_communication || '',
                remarks_admin: r.remarks_admin || '',
                remarks_training: r.remarks_training || '',
                response_remarks: r.response_remarks || ''
            });
        });

        lettersWorksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return;
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
            });
        });

        // 5. Style Data Rows (Borders and alignment)"""
js = js.replace(populate_block_orig, populate_block_new)

# 4. Fetch received records
fetch_logic = """    async function fetchRecords() {
        try {
            const response = await fetch(API_URL);
            const result = await response.json();

            if (result.success) {
                records = result.data || [];
                renderTable();
                renderSummary();
            } else {
                showToast('Failed to fetch records: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error fetching records:', error);
            showToast('Network error while fetching records.', 'error');
        }
    }"""
fetch_logic_new = fetch_logic + """
    async function fetchReceivedRecords() {
        try {
            const response = await fetch(RECEIVED_API_URL);
            const result = await response.json();

            if (result.success) {
                receivedRecords = result.data || [];
                renderReceivedTable();
            } else {
                showToast('Failed to fetch received records: ' + result.error, 'error');
            }
        } catch (error) {
            console.error('Error fetching received records:', error);
        }
    }"""
js = js.replace(fetch_logic, fetch_logic_new)

# 5. renderReceivedTable and generateReceivedRowHTML
render_logic = """    function renderTable() {
        let html = '';

        // Render existing rows
        records.forEach(record => {
            html += generateRowHTML(record, false);
        });

        tableBody.innerHTML = html;
        attachRowListeners();
        renderSummary(); // Ensure summary is updated when table renders

        // Apply RBAC UI restrictions to dynamically added buttons/inputs
        if (window.currentUser && window.applyRoleRestrictions) {
            window.applyRoleRestrictions(window.currentUser.role);
        } else {
            document.addEventListener('auth:ready', (e) => {
                window.applyRoleRestrictions(e.detail.role);
            }, { once: true });
        }
    }"""
render_logic_new = render_logic + """
    function renderReceivedTable() {
        let html = '';
        receivedRecords.forEach(record => {
            html += generateReceivedRowHTML(record, false);
        });
        lettersTableBody.innerHTML = html;
        attachRowListeners(lettersTableBody);
        
        if (window.currentUser && window.applyRoleRestrictions) {
            window.applyRoleRestrictions(window.currentUser.role);
        }
    }
    
    window.insertBlankReceivedRow = function() {
        const html = generateReceivedRowHTML({}, true);
        lettersTableBody.insertAdjacentHTML('afterbegin', html);
        attachRowListeners(lettersTableBody);
    };
    
    function generateReceivedRowHTML(record, isNew) {
        const id = isNew ? '' : record.id;
        const rowClass = isNew ? 'new-entry-row' : 'data-row';
        const safeVal = (val) => val ? val.toString().replace(/"/g, '&quot;') : '';
        const typeValue = record.type_of_activity || '';
        const statusValue = record.status || '';
        return `
            <tr class="${rowClass}" data-id="${id}">
                <td style="text-align: center;">
                    ${!isNew ? `
                        <button class="row-action-btn" onclick="deleteReceivedRow('${id}')" title="Delete Row" data-role-min="admin">✖</button>
                    ` : ''}
                </td>
                <td><input type="date" name="received_date" value="${safeVal(record.received_date)}"></td>
                <td><input type="date" name="date_of_activity" value="${safeVal(record.date_of_activity)}"></td>
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
                        ${(record.instructor_participants || '').split(/[,\\n]/).map(name => name.trim()).filter(name => name).map(name => `<span class="name-pill">${name}</span>`).join('')}
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
                <td><input type="text" name="actioned_communication" value="${safeVal(record.actioned_communication)}"></td>
                <td><input type="text" name="remarks_admin" value="${safeVal(record.remarks_admin)}"></td>
                <td><input type="text" name="remarks_training" value="${safeVal(record.remarks_training)}"></td>
                <td><input type="text" name="response_remarks" value="${safeVal(record.response_remarks)}"></td>
            </tr>
        `;
    }
"""
js = js.replace(render_logic, render_logic_new)

# 6. attachRowListeners update
js = js.replace("    function attachRowListeners() {\\n        const rows = document.querySelectorAll('#spreadsheet-body tr');", "    function attachRowListeners(tbody = tableBody) {\\n        const rows = tbody.querySelectorAll('tr');")

# 7. handleCellChange API_URL detection
handle_orig = "    async function handleCellChange(input, row) {"
handle_new = """    async function handleCellChange(input, row) {
        const currentApiUrl = row.closest('tbody').id === 'letters-body' ? RECEIVED_API_URL : API_URL;"""
js = js.replace(handle_orig, handle_new)

# Fix fetch calls inside handleCellChange, replace API_URL with currentApiUrl inside that function ONLY
# It occurs twice in handleCellChange
func_end = js.find("    function extractRowData(row)")
func_start = js.find("async function handleCellChange(input, row)")
sub_js = js[func_start:func_end]
sub_js_new = sub_js.replace("const response = await fetch(API_URL", "const response = await fetch(currentApiUrl")

# For the new row generation html replace
sub_js_new = sub_js_new.replace("""row.classList.add('data-row');
                    row.querySelector('td:first-child').innerHTML = `
                        <button class="edit-row-btn" onclick="openEditModal('${result.id}')" title="Edit Row" data-role-min="editor">✏️</button>
                        <button class="row-action-btn" onclick="deleteRow('${result.id}')" title="Delete Row" data-role-min="admin">✖</button>
                    `;""", """row.classList.add('data-row');
                    if (currentApiUrl === RECEIVED_API_URL) {
                        row.querySelector('td:first-child').innerHTML = `<button class="row-action-btn" onclick="deleteReceivedRow('${result.id}')" title="Delete Row" data-role-min="admin">✖</button>`;
                        receivedRecords.push({id: result.id, ...payload});
                    } else {
                        row.querySelector('td:first-child').innerHTML = `
                            <button class="edit-row-btn" onclick="openEditModal('${result.id}')" title="Edit Row" data-role-min="editor">✏️</button>
                            <button class="row-action-btn" onclick="deleteRow('${result.id}')" title="Delete Row" data-role-min="admin">✖</button>
                        `;
                    }""")
sub_js_new = sub_js_new.replace("""const record = records.find(r => r.id == id);
                    if (record) {
                        record[input.name] = input.value;
                        if (input.name === 'no_of_pax') record.no_of_pax = parseInt(input.value) || 0;
                        renderSummary(); // Trigger update
                    }""", """if (currentApiUrl === RECEIVED_API_URL) {
                        const record = receivedRecords.find(r => r.id == id);
                        if (record) {
                            record[input.name] = input.value;
                            if (input.name === 'no_of_pax') record.no_of_pax = parseInt(input.value) || 0;
                        }
                    } else {
                        const record = records.find(r => r.id == id);
                        if (record) {
                            record[input.name] = input.value;
                            if (input.name === 'no_of_pax') record.no_of_pax = parseInt(input.value) || 0;
                            renderSummary(); 
                        }
                    }""")

js = js[:func_start] + sub_js_new + js[func_end:]

# 8. setupTabs and deleteReceivedRow
tab_logic = """
    function setupTabs() {
        const btnTracker = document.getElementById('tab-tracker');
        const btnLetters = document.getElementById('tab-letters');
        const containerTracker = document.getElementById('tracker-container');
        const containerLetters = document.getElementById('letters-container');
        const summaryCards = document.getElementById('summary-cards');
        const btnAdd = document.getElementById('btn-add-event');
        
        // Save original click for btnAdd to handle modal
        const originalBtnAddClick = btnAdd.onclick;
        
        btnTracker.addEventListener('click', () => {
            activeTab = 'tracker';
            btnTracker.classList.add('active');
            btnLetters.classList.remove('active');
            containerTracker.style.display = 'block';
            containerLetters.style.display = 'none';
            summaryCards.style.display = 'grid';
            btnAdd.innerHTML = '<span>➕</span> Add New Event';
        });
        
        btnLetters.addEventListener('click', () => {
            activeTab = 'letters';
            btnLetters.classList.add('active');
            btnTracker.classList.remove('active');
            containerTracker.style.display = 'none';
            containerLetters.style.display = 'block';
            summaryCards.style.display = 'none';
            btnAdd.innerHTML = '<span>➕</span> Add New Row';
        });
        
        // Override btnAdd click globally
        btnAdd.addEventListener('click', (e) => {
            if (activeTab === 'letters') {
                e.stopPropagation();
                window.insertBlankReceivedRow();
            }
        });
    }
    
    window.deleteReceivedRow = async function (id) {
        if (!confirm('Delete this received letter row completely?')) return;
        try {
            const url = `${RECEIVED_API_URL}?id=${id}`;
            const response = await fetch(url, { method: 'DELETE' });
            const result = await response.json();
            if (result.success) {
                const row = lettersTableBody.querySelector(`tr[data-id="${id}"]`);
                if (row) row.remove();
                receivedRecords = receivedRecords.filter(r => r.id != id);
                showToast('Row deleted', 'success', true);
                syncToExcel(true);
            } else {
                showToast('Failed to delete: ' + (result.error || 'Unknown error'), 'error');
            }
        } catch (error) {
            showToast('Delete error', 'error');
        }
    };
"""

js += tab_logic

with open('c:\\xampp\\htdocs\\breti\\training_tracker.js', 'w', encoding='utf-8') as f:
    f.write(js)
print("Updated js successfully")
