document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('certificate-form');
    const previewContainer = document.getElementById('certificate-preview');
    const additionalFields = document.getElementById('additional-fields');

    // Form Inputs
    const inputRecipient = document.getElementById('recipient-name');
    const btnAddRecipient = document.getElementById('btn-add-recipient');
    const recipientsList = document.getElementById('recipients-list');
    const recipientCount = document.getElementById('recipient-count');

    const inputDate = document.getElementById('issue-date');
    const inputVenue = document.getElementById('venue-name');
    const inputBody = document.getElementById('certificate-body');
    const designRadios = document.querySelectorAll('input[name="design"]');
    const sig1Name = document.getElementById('sig-1-name');
    const sig1Title = document.getElementById('sig-1-title');

    // ── Recipients Array ──────────────────────────────────────────────
    let recipients = [];

    function renderRecipientsList() {
        recipientsList.innerHTML = '';
        recipients.forEach((name, i) => {
            const li = document.createElement('li');
            li.className = 'recipient-tag';
            li.innerHTML = `
                <span class="recipient-tag-name">${escapeHtml(name)}</span>
                <button type="button" class="recipient-remove" data-index="${i}" title="Remove">✕</button>
            `;
            recipientsList.appendChild(li);
        });

        // Update counter
        if (recipients.length === 0) {
            recipientCount.textContent = '';
        } else {
            recipientCount.textContent = `(${recipients.length} recipient${recipients.length > 1 ? 's' : ''})`;
        }

        // Live preview always shows the first recipient
        updatePreview();
    }

    function addRecipient() {
        const name = inputRecipient.value.trim();
        if (!name) return;
        if (recipients.includes(name)) {
            inputRecipient.value = '';
            return;
        }
        recipients.push(name);
        inputRecipient.value = '';
        renderRecipientsList();
    }

    btnAddRecipient.addEventListener('click', addRecipient);

    inputRecipient.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addRecipient();
        }
    });

    recipientsList.addEventListener('click', (e) => {
        const btn = e.target.closest('.recipient-remove');
        if (!btn) return;
        const idx = parseInt(btn.dataset.index, 10);
        recipients.splice(idx, 1);
        renderRecipientsList();
    });

    // ── Helpers ───────────────────────────────────────────────────────
    function escapeHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // ── Initialize ────────────────────────────────────────────────────
    const today = new Date().toISOString().split('T')[0];
    inputDate.value = today;

    inputBody.value = "In grateful acknowledgement of his distinguished and invaluable service rendered as Course / Achievement Title and thereby imparting his knowledge and contributing immeasurably to the success of the the program.";

    additionalFields.style.display = 'block';

    // ── Live Preview Listeners ────────────────────────────────────────
    const certTypeRadios = document.querySelectorAll('input[name="cert-type"]');
    [...designRadios, ...certTypeRadios].forEach(radio => {
        radio.addEventListener('change', updatePreview);
    });

    [inputDate, inputVenue, inputBody, sig1Name, sig1Title].forEach(el => {
        if (el) el.addEventListener('input', updatePreview);
    });

    // Typing in the name field also updates preview in real-time
    inputRecipient.addEventListener('input', updatePreview);

    function updatePreview() {
        // Show first confirmed recipient, or what's being typed, or placeholder
        const previewName =
            recipients.length > 0
                ? recipients[0]
                : (inputRecipient.value.trim() || 'Recipient Name');

        const bodyContent = inputBody.value || 'In grateful acknowledgement...';
        const venue = inputVenue ? inputVenue.value || 'Provincial Capitol' : 'Provincial Capitol';
        const dateStr = formatDate(inputDate.value);
        const designRadio = document.querySelector('input[name="design"]:checked');
        const design = designRadio ? designRadio.value : 'modern-blue';
        const typeRadio = document.querySelector('input[name="cert-type"]:checked');
        const type = typeRadio ? typeRadio.value : 'recognition';

        const signatories = [
            { name: sig1Name ? sig1Name.value || '' : '', title: sig1Title ? sig1Title.value || 'Training Unit Head PDRRMO Davao del sur' : 'Training Unit Head PDRRMO Davao del sur' },
            { name: 'HANIE B. FLORES, RSW', title: 'OIC PDRRMO' },
            { name: 'HON. YVONE R. CAGAS', title: 'Governor PDRRMC Chairperson' }
        ];

        renderUnifiedCertificate({ design, type, recipient: previewName, bodyContent, venue, dateStr, signatories });
    }

    function getLogoHeader() {
        return `
            <div class="cert-header-logos">
                <img src="logo_ocd.jpg" alt="OCD Logo" class="logo-img">
                <img src="logo_davao.jpg" alt="Province of Davao de Oro Logo" class="logo-img">
                <img src="logo_pdrrmc.jpg" alt="PDRRMC Logo" class="logo-img">
            </div>
            <div class="official-header-text">
                Office of Civil Defense XI<br>
                Province of Davao del Sur<br>
                Provincial Disaster Risk Reduction and Management Office
            </div>
        `;
    }

    function renderUnifiedCertificate(data) {
        const bgImage = data.design === 'elegant-gold' ? 'elegant_gold_bg.png?v=2' : 'frame.png';
        previewContainer.className = `certificate-container design-official-recognition design-${data.design}`;

        const d = new Date(inputDate.value || new Date());
        const day = d.getDate();
        const month = d.toLocaleString('en-US', { month: 'long' });
        const year = d.getFullYear();
        const ordinal = getOrdinalNum(day);

        const bannerText = data.type === 'completion' ? 'OF COMPLETION' : 'OF RECOGNITION';

        previewContainer.innerHTML = `
            <img src="${bgImage}" alt="" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;display:block;" />
            <div class="official-header" style="position:relative;z-index:1;">
                ${getLogoHeader()}
            </div>
            <div class="official-body-container" style="position:relative;z-index:1;">
                <div class="official-left-content">
                    <h1 class="official-main-title">CERTIFICATE</h1>
                    <div class="official-banner">${bannerText}</div>
                    
                    <p class="official-presented-label">PROUDLY PRESENTED TO:</p>
                    <h2 class="official-recipient-name">${data.recipient}</h2>
                    <div class="official-name-underline"></div>
                    
                    <p class="official-body-text">
                        ${data.bodyContent}
                    </p>
                    
                    <p class="official-venue-info">Held on <strong>${data.dateStr}</strong> at <strong>${data.venue}</strong>.</p>
                    <p class="official-date-info">Given this ${day}${ordinal} day of ${month} ${year}</p>
                    
                    <div class="official-footer-signatories">
                        ${data.signatories.filter(s => s.name.trim() !== '').map(sig => `
                            <div class="official-signatory">
                                <div class="official-sig-line"></div>
                                <p class="official-sig-name">${sig.name}</p>
                                <p class="official-sig-title">${sig.title}</p>
                            </div>
                        `).join('')}
                    </div>
                    ${data.type === 'completion' ? `<p class="official-cert-id">ID: training course PDRRM DAUSUR ${data.id || ''}</p>` : ''}
                </div>
            </div>
        `;
    }

    function formatDate(dateStr) {
        if (!dateStr) return 'Date Here';
        return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    }

    function getOrdinalNum(n) {
        return (n > 3 && n < 21) || n % 10 > 3 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10];
    }

    function generateCertId(type, dateStr) {
        if (type === 'completion') {
            const d = new Date(dateStr || new Date());
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            const random = Math.floor(10000 + Math.random() * 90000);
            return `${day}${month}${year}-${random}`;
        }
        return Date.now().toString() + Math.floor(Math.random() * 1000);
    }

    // ── Form Submission (Batch) ───────────────────────────────────────
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (recipients.length === 0) {
            const typedName = inputRecipient.value.trim();
            if (typedName) {
                recipients.push(typedName);
                renderRecipientsList();
            } else {
                alert('Please add at least one recipient before issuing certificates.');
                inputRecipient.focus();
                return;
            }
        }

        const design = document.querySelector('input[name="design"]:checked').value;
        const type = document.querySelector('input[name="cert-type"]:checked').value;

        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = '⏳ Saving...';

        const certsToSave = recipients.map(recipientName => ({
            id: generateCertId(type, inputDate.value),
            recipient: recipientName,
            bodyContent: inputBody.value,
            date: inputDate.value,
            venue: inputVenue ? inputVenue.value || 'Provincial Capitol' : 'Provincial Capitol',
            design: design,
            type: type,
            signatories: [
                { name: sig1Name ? sig1Name.value || '' : '', title: sig1Title ? sig1Title.value || 'Training Unit Head PDRRMO Davao del sur' : 'Training Unit Head PDRRMO Davao del sur' },
                { name: 'HANIE B. FLORES, RSW', title: 'OIC PDRRMO' },
                { name: 'HON. YVONE R. CAGAS', title: 'Governor PDRRMC Chairperson' }
            ],
            issuedAt: new Date().toISOString()
        }));

        try {
            const response = await fetch('api/certificates.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(certsToSave)
            });

            const result = await response.json();

            if (result.success) {
                alert(`✅ ${result.saved} certificate${result.saved > 1 ? 's' : ''} issued successfully!`);
                window.location.href = 'view.html';
            } else {
                alert('❌ Failed to save certificates: ' + (result.error || 'Unknown error'));
            }
        } catch (err) {
            console.error('Error saving certificates:', err);
            alert('❌ Could not connect to the server. Make sure PHP is running.');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });

    // ── Initial render ────────────────────────────────────────────────
    updatePreview();
});
