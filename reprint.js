document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('reprint-search');
    const searchBtn = document.getElementById('btn-search');
    const previewContainer = document.getElementById('reprint-preview-container');
    const certContent = document.getElementById('certificate-to-print');
    const noResult = document.getElementById('no-result');
    const printBtn = document.getElementById('btn-print');
    const downloadBtn = document.getElementById('btn-download');

    // Check for ID in URL
    const urlParams = new URLSearchParams(window.location.search);
    const certId = urlParams.get('id');

    if (certId) {
        searchInput.value = certId;
        searchCertificate(certId);
    }

    searchBtn.addEventListener('click', () => {
        searchCertificate(searchInput.value.trim());
    });

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchCertificate(searchInput.value.trim());
        }
    });

    // ── Search via PHP API ────────────────────────────────────────────
    async function searchCertificate(query) {
        if (!query) return;

        searchBtn.disabled = true;
        searchBtn.textContent = '⏳ Searching...';

        try {
            const response = await fetch(`api/certificates.php?query=${encodeURIComponent(query)}`);
            const result = await response.json();

            if (result.success && result.data && result.data.length > 0) {
                displayCertificate(result.data[0]);
                noResult.style.display = 'none';
                previewContainer.style.display = 'block';
            } else {
                previewContainer.style.display = 'none';
                noResult.style.display = 'block';
            }
        } catch (e) {
            console.error('Error searching for certificate:', e);
            noResult.style.display = 'block';
            previewContainer.style.display = 'none';
        } finally {
            searchBtn.disabled = false;
            searchBtn.textContent = '🔍 Search';
        }
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

    function displayCertificate(cert) {
        try {
            let dateStr = 'Unknown Date';
            if (cert.date) {
                const d = new Date(cert.date);
                if (!isNaN(d.getTime())) {
                    dateStr = d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
                }
            }

            const design = cert.design || 'standard';
            const venue = cert.venue || 'Provincial Capitol';
            const signatories = cert.signatories || [
                { name: '', title: 'Training Unit Head PDRRMO Davao del sur' },
                { name: 'HANIE B. FLORES, RSW', title: 'OIC PDRRMO' },
                { name: 'HON. YVONE R. CAGAS', title: 'Governor PDRRMC Chairperson' }
            ];

            const d = new Date(cert.date || new Date());
            const day = !isNaN(d.getTime()) ? d.getDate() : new Date().getDate();
            const month = !isNaN(d.getTime()) ? d.toLocaleString('en-US', { month: 'long' }) : new Date().toLocaleString('en-US', { month: 'long' });
            const year = !isNaN(d.getTime()) ? d.getFullYear() : new Date().getFullYear();
            const ordinal = getOrdinalNum(day);

            const bannerText = cert.type === 'completion' ? 'OF COMPLETION' : 'OF RECOGNITION';
            const certIdDisplay = cert.type === 'completion' ? `<p class="official-cert-id">ID: training course PDRRM DAUSUR ${cert.id}</p>` : '';

            certContent.className = `certificate-container design-official-recognition design-${design}`;
            certContent.innerHTML = `
                <div class="official-header">
                    ${getLogoHeader()}
                </div>
                <div class="official-body-container">
                    <div class="official-left-content">
                        <h1 class="official-main-title">CERTIFICATE</h1>
                        <div class="official-banner">${bannerText}</div>
                        
                        <p class="official-presented-label">PROUDLY PRESENTED TO:</p>
                        <h2 class="official-recipient-name">${cert.recipient || 'Recipient Name'}</h2>
                        <div class="official-name-underline"></div>
                        
                        <p class="official-body-text">
                            ${cert.bodyContent ? cert.bodyContent : `
                            ${cert.bodyIntro || 'In grateful acknowledgement of his distinguished and invaluable service rendered as'} 
                            <strong style="text-decoration: underline;">${cert.title || 'Course / Achievement Title'}</strong> and thereby 
                            imparting his knowledge and contributing immeasurably to the success of the <strong>${cert.content || 'the program'}</strong>.
                            `}
                        </p>
                        
                        <p class="official-venue-info">Held on <strong>${dateStr}</strong> at <strong>${venue}</strong>.</p>
                        <p class="official-date-info">Given this ${day}${ordinal} day of ${month} ${year}</p>
                        
                        <div class="official-footer-signatories">
                            ${signatories.filter(s => s && s.name && s.name.trim() !== '').map(sig => `
                                <div class="official-signatory">
                                    <div class="official-sig-line"></div>
                                    <p class="official-sig-name">${sig.name}</p>
                                    <p class="official-sig-title">${sig.title}</p>
                                </div>
                            `).join('')}
                        </div>
                        ${certIdDisplay}
                    </div>
                </div>
            `;
        } catch (err) {
            console.error('Failed to display certificate:', err);
            certContent.innerHTML = '<p style="padding: 2rem; color: #ff5252;">Error: Could not render this certificate. Data might be corrupted.</p>';
        }
    }

    function getOrdinalNum(n) {
        return (n > 3 && n < 21) || n % 10 > 3 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10];
    }

    printBtn.addEventListener('click', () => {
        window.print();
    });

    downloadBtn.addEventListener('click', () => {
        alert('Downloading PDF is simulated. In a real environment, this would use a library like jsPDF or a server-side generator.');
    });
});
