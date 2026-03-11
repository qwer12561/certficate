document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('certificates-list');
    const searchInput = document.getElementById('view-search');
    const sortSelect = document.getElementById('view-sort');

    // Modal Elements
    const modal = document.getElementById('preview-modal');
    const modalContent = document.getElementById('modal-cert-container');
    const closeBtn = document.querySelector('.close-modal');
    const printBtn = document.getElementById('modal-print-btn');
    const downloadBtn = document.getElementById('modal-download-btn');

    let certificates = [];

    // ── Load certificates from PHP API ───────────────────────────────
    async function loadCertificates() {
        listContainer.innerHTML = `
            <div class="empty-state">
                <h3>⏳ Loading certificates...</h3>
                <p>Fetching from database...</p>
            </div>
        `;
        try {
            const response = await fetch('api/certificates.php');
            const result = await response.json();

            if (result.success) {
                certificates = result.data.filter(c => c && c.recipient);
                renderCertificates(filterAndSort());
            } else {
                showError('Failed to load certificates: ' + (result.error || 'Unknown error'));
            }
        } catch (err) {
            console.error('Failed to load certificates:', err);
            showError('Could not connect to the server. Make sure PHP is running.');
        }
    }

    function showError(msg) {
        listContainer.innerHTML = `
            <div class="empty-state">
                <h3>❌ Error</h3>
                <p>${msg}</p>
            </div>
        `;
    }

    function renderCertificates(data) {
        if (!data || data.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-state">
                    <h3>No certificates found</h3>
                    <p>Start by creating a new certificate from the main menu.</p>
                </div>
            `;
            return;
        }

        listContainer.innerHTML = '';
        data.forEach(cert => {
            const card = document.createElement('div');
            card.className = 'certificate-card';

            let dateStr = 'Unknown Date';
            const dateVal = cert.date || cert.issuedAt;
            if (dateVal) {
                const d = new Date(dateVal);
                if (!isNaN(d.getTime())) {
                    dateStr = d.toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric'
                    });
                }
            }

            const designDisplay = (cert.design || 'standard').replace('-', ' ');

            card.innerHTML = `
                <div class="cert-card-header">
                    <span class="cert-card-design">${designDisplay}</span>
                    <span class="cert-card-date">${dateStr}</span>
                </div>
                <div class="cert-card-body">
                    <h3 class="cert-card-recipient">${cert.recipient || 'Unnamed'}</h3>
                    <p class="cert-card-title">${cert.type === 'completion' ? 'Certificate of Completion' : 'Certificate of Recognition'}</p>
                </div>
                <div class="cert-card-actions">
                    <button class="btn-icon" title="View Certificate" onclick="openPreviewModal('${cert.id}')">
                        <i class="fa fa-eye"></i>
                    </button>
                    <button class="btn-icon" title="Reprint/Print" onclick="reprintCertificate('${cert.id}')">
                        <i class="fa fa-print"></i>
                    </button>
                    <button class="btn-icon delete" title="Delete" onclick="deleteCertificate('${cert.id}')">
                        <i class="fa fa-trash"></i>
                    </button>
                </div>
            `;
            listContainer.appendChild(card);
        });
    }

    // Modal Actions
    window.openPreviewModal = (id) => {
        const cert = certificates.find(c => c.id === id);
        if (!cert) return;

        modalContent.innerHTML = renderCertificateHTML(cert);
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';

        printBtn.onclick = () => {
            window.location.href = `reprint.html?id=${id}&print=true`;
        };

        if (downloadBtn) {
            downloadBtn.onclick = () => {
                const element = modalContent.querySelector('.certificate-container');
                if (!element) return;

                const recipientName = element.querySelector('.official-recipient-name').textContent.trim() || 'Certificate';

                const opt = {
                    margin: 0,
                    filename: `Certificate_${recipientName.replace(/\s+/g, '_')}.pdf`,
                    image: { type: 'jpeg', quality: 0.98 },
                    html2canvas: {
                        scale: 3,
                        useCORS: true,
                        logging: false,
                        letterRendering: false
                    },
                    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
                };

                const originalText = downloadBtn.textContent;
                downloadBtn.disabled = true;
                downloadBtn.textContent = '⏳ Generating...';

                html2pdf().set(opt).from(element).save().then(() => {
                    downloadBtn.disabled = false;
                    downloadBtn.textContent = originalText;
                }).catch(err => {
                    console.error('PDF Generation Error:', err);
                    showToast('❌ Failed to generate PDF.', 'error');
                    downloadBtn.disabled = false;
                    downloadBtn.textContent = originalText;
                });
            };
        }
    };

    if (closeBtn) {
        closeBtn.onclick = () => {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        };
    }

    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    };

    window.reprintCertificate = (id) => {
        window.location.href = `reprint.html?id=${id}`;
    };

    // ── Delete via API ────────────────────────────────────────────────
    window.deleteCertificate = async (id) => {
        if (!confirm('Are you sure you want to delete this certificate?')) return;

        try {
            const response = await fetch(`api/certificates.php?id=${encodeURIComponent(id)}`, {
                method: 'DELETE'
            });
            const result = await response.json();

            if (result.success) {
                certificates = certificates.filter(c => c.id !== id);
                renderCertificates(filterAndSort());
            } else {
                showToast('❌ Failed to delete: ' + (result.error || 'Unknown error'), 'error');
            }
        } catch (err) {
            console.error('Delete error:', err);
            showToast('❌ Could not connect to the server.', 'error');
        }
    };

    function renderCertificateHTML(data) {
        const d = new Date(data.date || new Date());
        const day = d.getDate();
        const month = d.toLocaleString('en-US', { month: 'long' });
        const year = d.getFullYear();
        const ordinal = getOrdinalNum(day);

        const fullDateStr = formatDate(data.date);

        const sigs = data.signatories || [
            { name: 'HANIE B. FLORES, RSW', title: 'OIC PDRRMO', signature: 'sig_transparent.png' },
            { name: 'HON. YVONE R. CAGAS', title: 'Governor PDRRMC Chairperson', signature: 'gov.png' }
        ];

        const bannerText = data.type === 'completion' ? 'OF COMPLETION' : 'OF RECOGNITION';
        const certIdDisplay = data.type === 'completion' ? `<p class="official-cert-id">ID: training course PDRRMO DAVSUR ${data.id}</p>` : '';

        let bgImage = data.design === 'elegant-gold' ? 'elegant_gold_bg.png?v=2' : 'frame.png';
        if (data.templatePath) {
            bgImage = data.templatePath;
        }

        return `
        <div class="certificate-container design-official-recognition design-${data.design}">
                <img src="${bgImage}" alt="" style="position:absolute;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;display:block;" />
                <div class="official-header" style="position:relative;z-index:1;">
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
                </div>
                <div class="official-body-container" style="position:relative;z-index:1;">
                    <div class="official-left-content">
                        <h1 class="official-main-title">CERTIFICATE</h1>
                        <div class="official-banner">${bannerText}</div>
                        
                        <p class="official-presented-label">PROUDLY PRESENTED TO:</p>
                        <h2 class="official-recipient-name">${data.recipient}</h2>
                        <div class="official-name-underline"></div>
                        
                        <p class="official-body-text">
                            ${data.bodyContent ? data.bodyContent : `
                            ${data.bodyIntro || 'In grateful acknowledgement of his distinguished and invaluable service rendered as'} 
                            <strong style="text-decoration: underline;">${data.title || 'Course / Achievement Title'}</strong> and thereby 
                            imparting his knowledge and contributing immeasurably to the success of the <strong>${data.content || 'the program'}</strong>.
                            `}
                        </p>
                        
                        <p class="official-venue-info">Held on <strong>${fullDateStr}</strong> at <strong>${data.venue || 'Provincial Capitol'}</strong>.</p>
                        <p class="official-date-info">Given this ${day}${ordinal} day of ${month} ${year}</p>
                        
                        <div class="official-footer-signatories">
                            ${sigs.filter(s => s && s.name && s.name.trim() !== '').map(sig => `
                                <div class="official-signatory">
                                    ${sig.signature ? `<img src="${sig.signature}" alt="Signature" class="official-sig-image">` : ''}
                                    <div class="official-sig-line"></div>
                                    <p class="official-sig-name">${sig.name}</p>
                                    <p class="official-sig-title">${sig.title}</p>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
                ${certIdDisplay}
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

    // ── Filter and Sort ───────────────────────────────────────────────
    function filterAndSort() {
        let filtered = [...certificates];
        const search = searchInput.value.toLowerCase();

        if (search) {
            filtered = filtered.filter(c =>
                (c.recipient && c.recipient.toLowerCase().includes(search)) ||
                (c.title && c.title.toLowerCase().includes(search))
            );
        }

        const sortValue = sortSelect.value;
        filtered.sort((a, b) => {
            const dateA = new Date(a.issuedAt || a.date || 0);
            const dateB = new Date(b.issuedAt || b.date || 0);

            if (sortValue === 'newest') return dateB - dateA;
            if (sortValue === 'oldest') return dateA - dateB;
            if (sortValue === 'name') return (a.recipient || '').localeCompare(b.recipient || '');
            return 0;
        });

        return filtered;
    }

    searchInput.addEventListener('input', () => {
        renderCertificates(filterAndSort());
    });

    sortSelect.addEventListener('change', () => {
        renderCertificates(filterAndSort());
    });

    loadCertificates();
});
