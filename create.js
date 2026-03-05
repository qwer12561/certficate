document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('certificate-form');
    const previewContainer = document.getElementById('certificate-preview');
    const additionalFields = document.getElementById('additional-fields');

    // Form Inputs
    const inputRecipient = document.getElementById('recipient-name');
    const inputDate = document.getElementById('issue-date');
    const inputVenue = document.getElementById('venue-name');
    const inputBody = document.getElementById('certificate-body');
    const designRadios = document.querySelectorAll('input[name="design"]');

    const sig1Name = document.getElementById('sig-1-name');
    const sig1Title = document.getElementById('sig-1-title');

    // Initialize Date with today
    const today = new Date().toISOString().split('T')[0];
    inputDate.value = today;

    // Initialize Body with default
    inputBody.value = "In grateful acknowledgement of his distinguished and invaluable service rendered as Course / Achievement Title and thereby imparting his knowledge and contributing immeasurably to the success of the the program.";

    // Design and Type listeners
    const certTypeRadios = document.querySelectorAll('input[name="cert-type"]');
    [...designRadios, ...certTypeRadios].forEach(radio => {
        radio.addEventListener('change', () => {
            updatePreview();
        });
    });

    // Always show additional fields as all certificates now support them
    additionalFields.style.display = 'block';

    // Always show additional fields as all certificates now support them
    additionalFields.style.display = 'block';

    // Live Preview Listeners
    [inputRecipient, inputDate, inputVenue, inputBody,
        sig1Name, sig1Title].forEach(el => {
            if (el) el.addEventListener('input', updatePreview);
        });

    function updatePreview() {
        const recipient = inputRecipient.value || 'Recipient Name';
        const bodyContent = inputBody.value || 'In grateful acknowledgement of his distinguished and invaluable service rendered as Course / Achievement Title and thereby imparting his knowledge and contributing immeasurably to the success of the the program.';
        const venue = inputVenue.value || 'Provincial Capitol';
        const dateStr = formatDate(inputDate.value);
        const designRadio = document.querySelector('input[name="design"]:checked');
        const design = designRadio ? designRadio.value : 'standard';

        const typeRadio = document.querySelector('input[name="cert-type"]:checked');
        const type = typeRadio ? typeRadio.value : 'recognition';

        const signatories = [
            { name: sig1Name.value || '', title: sig1Title.value || 'Training Unit Head PDRRMO Davao del sur' },
            { name: 'HANIE B. FLORES, RSW', title: 'OIC PDRRMO' },
            { name: 'HON. YVONE R. CAGAS', title: 'Governor PDRRMC Chairperson' }
        ];

        renderUnifiedCertificate({
            design,
            type,
            recipient,
            bodyContent,
            venue,
            dateStr,
            signatories
        });
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
        // Universal high-quality template
        previewContainer.className = `certificate-container design-official-recognition design-${data.design}`;

        const d = new Date(inputDate.value || new Date());
        const day = d.getDate();
        const month = d.toLocaleString('en-US', { month: 'long' });
        const year = d.getFullYear();
        const ordinal = getOrdinalNum(day);

        const bannerText = data.type === 'completion' ? 'OF COMPLETION' : 'OF RECOGNITION';

        previewContainer.innerHTML = `
            <div class="official-header">
                ${getLogoHeader()}
            </div>
            <div class="official-body-container">
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
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateStr).toLocaleDateString('en-US', options);
    }

    function getOrdinalNum(n) {
        return (n > 3 && n < 21) || n % 10 > 3 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10];
    }

    // Form Submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const design = document.querySelector('input[name="design"]:checked').value;
        const type = document.querySelector('input[name="cert-type"]:checked').value;

        // Generate formatted ID for completion type
        let certId = Date.now().toString();
        if (type === 'completion') {
            const d = new Date(inputDate.value || new Date());
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            const random = Math.floor(10000 + Math.random() * 90000);
            certId = `${day}${month}${year}-${random}`;
        }

        const certData = {
            id: certId,
            recipient: inputRecipient.value,
            bodyContent: inputBody.value,
            date: inputDate.value,
            venue: inputVenue.value || "Provincial Capitol",
            design: design,
            type: type,
            signatories: [
                { name: sig1Name.value || '', title: sig1Title.value || 'Training Unit Head PDRRMO Davao del sur' },
                { name: 'HANIE B. FLORES, RSW', title: 'OIC PDRRMO' },
                { name: 'HON. YVONE R. CAGAS', title: 'Governor PDRRMC Chairperson' }
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
