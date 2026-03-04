document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('certificate-form');
    const previewContainer = document.getElementById('certificate-preview');
    const additionalFields = document.getElementById('additional-fields');

    // Form Inputs
    const inputRecipient = document.getElementById('recipient-name');
    const inputTitle = document.getElementById('certificate-title');
    const inputContent = document.getElementById('certificate-text');
    const inputIssuer = document.getElementById('issuer-name');
    const inputDate = document.getElementById('issue-date');
    const inputVenue = document.getElementById('venue-name');
    const designRadios = document.querySelectorAll('input[name="design"]');

    // Signatory Inputs
    const sig1Name = document.getElementById('sig-1-name');
    const sig1Title = document.getElementById('sig-1-title');
    const sig2Name = document.getElementById('sig-2-name');
    const sig2Title = document.getElementById('sig-2-title');
    const sig3Name = document.getElementById('sig-3-name');
    const sig3Title = document.getElementById('sig-3-title');

    // Initialize Date with today
    const today = new Date().toISOString().split('T')[0];
    inputDate.value = today;

    // Design selection logic (All designs now use the unified layout)
    designRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            updatePreview();
        });
    });

    // Always show additional fields as all certificates now support them
    additionalFields.style.display = 'block';

    // Sync Signatory 1 with Issuer name by default
    inputIssuer.addEventListener('input', (e) => {
        if (!sig1Name.value) {
            sig1Name.value = e.target.value;
        }
        updatePreview();
    });

    // Live Preview Listeners
    [inputRecipient, inputTitle, inputContent, inputIssuer, inputDate, inputVenue,
        sig1Name, sig1Title, sig2Name, sig2Title, sig3Name, sig3Title].forEach(el => {
            if (el) el.addEventListener('input', updatePreview);
        });

    function updatePreview() {
        const recipient = inputRecipient.value || 'Recipient Name';
        const title = inputTitle.value || 'Course / Achievement Title';
        const content = inputContent.value || 'For their outstanding dedication and exceptional performance in all areas of the program.';
        const issuer = inputIssuer.value || 'Authorized Signatory';
        const venue = inputVenue.value || 'Provincial Capitol';
        const dateStr = formatDate(inputDate.value);
        const designRadio = document.querySelector('input[name="design"]:checked');
        const design = designRadio ? designRadio.value : 'standard';

        const signatories = [
            { name: sig1Name.value || issuer, title: sig1Title.value || 'Position' },
            { name: sig2Name.value || '', title: sig2Title.value || '' },
            { name: sig3Name.value || '', title: sig3Title.value || '' }
        ];

        renderUnifiedCertificate({
            design,
            recipient,
            title,
            content,
            venue,
            dateStr,
            signatories
        });
    }

    function getLogoHeader() {
        return `
            <div class="cert-header-logos">
                <img src="logo_pdrrmc.jpg" alt="PDRRMC Logo" class="logo-img">
                <img src="logo_ocd.jpg" alt="OCD Logo" class="logo-img">
                <img src="logo_davao.jpg" alt="Province Logo" class="logo-img">
            </div>
        `;
    }

    function renderUnifiedCertificate(data) {
        // Universal high-quality template
        previewContainer.className = `certificate-container design-official-recognition design-${data.design}`;

        const d = new Date(inputDate.value || new Date());
        const day = d.getDate();
        const month = d.toLocaleString('en-US', { month: 'long' });
        const year = d.getFullYear();
        const ordinal = getOrdinalNum(day);

        previewContainer.innerHTML = `
            <div class="official-header">
                ${getLogoHeader()}
            </div>
            <div class="official-body-container">
                <div class="official-left-content">
                    <h1 class="official-main-title">CERTIFICATE</h1>
                    <div class="official-banner">OF RECOGNITION</div>
                    
                    <p class="official-presented-label">PROUDLY PRESENTED TO:</p>
                    <h2 class="official-recipient-name">${data.recipient}</h2>
                    <div class="official-name-underline"></div>
                    
                    <p class="official-body-text">
                        In grateful acknowledgement of his distinguished and invaluable service rendered as 
                        <strong style="text-decoration: underline;">${data.title}</strong> and thereby 
                        imparting his knowledge and contributing immeasurably to the success of the <strong>${data.content}</strong>.
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
                </div>
            </div>
        `;
    }

    function formatDate(dateStr) {
        if (!dateStr) return 'Date Here';
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString('en-US', options);
    }

    function getOrdinalNum(n) {
        return n + (n > 0 ? ['th', 'st', 'nd', 'rd'][(n > 3 && n < 21) || n % 10 > 3 ? 0 : n % 10] : '');
    }

    // Form Submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const design = document.querySelector('input[name="design"]:checked').value;
        const certData = {
            id: Date.now().toString(),
            recipient: inputRecipient.value,
            title: inputTitle.value,
            content: inputContent.value,
            issuer: inputIssuer.value,
            date: inputDate.value,
            venue: inputVenue.value || "Provincial Capitol",
            design: design,
            signatories: [
                { name: sig1Name.value || inputIssuer.value, title: sig1Title.value || 'Position' },
                { name: sig2Name.value || '', title: sig2Title.value || '' },
                { name: sig3Name.value || '', title: sig3Title.value || '' }
            ],
            issuedAt: new Date().toISOString()
        };

        saveCertificate(certData);
    });

    function saveCertificate(data) {
        try {
            const certificates = JSON.parse(localStorage.getItem('certificates') || '[]');
            certificates.push(data);
            localStorage.setItem('certificates', JSON.stringify(certificates));

            alert('Certificate for ' + data.recipient + ' has been issued and saved to history!');
            window.location.href = 'view.html';
        } catch (error) {
            console.error('Error saving certificate:', error);
            alert('Failed to save certificate.');
        }
    }

    // Initial render
    updatePreview();
});
