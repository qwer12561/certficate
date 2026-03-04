document.addEventListener('DOMContentLoaded', () => {
    const listContainer = document.getElementById('certificates-list');
    const searchInput = document.getElementById('view-search');
    const sortSelect = document.getElementById('view-sort');

    // Modal Elements
    const modal = document.getElementById('preview-modal');
    const modalContent = document.getElementById('modal-cert-container');
    const closeBtn = document.querySelector('.close-modal');
    const printBtn = document.getElementById('modal-print-btn');

    let certificates = [];

    // Load certificates
    function loadCertificates() {
        try {
            certificates = JSON.parse(localStorage.getItem('certificates') || '[]');
            certificates = certificates.filter(c => c && c.recipient);
            renderCertificates(filterAndSort());
        } catch (e) {
            console.error('Failed to load certificates:', e);
            renderCertificates([]);
        }
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
                    <p class="cert-card-title">${cert.title || 'Untitled Certificate'}</p>
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
        document.body.style.overflow = 'hidden'; // Prevent scroll

        printBtn.onclick = () => {
            window.location.href = `reprint.html?id=${id}&print=true`;
        };
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

    window.deleteCertificate = (id) => {
        if (confirm('Are you sure you want to delete this certificate?')) {
            certificates = certificates.filter(c => c.id !== id);
            localStorage.setItem('certificates', JSON.stringify(certificates));
            renderCertificates(filterAndSort());
        }
    };

    function renderCertificateHTML(data) {
        const d = new Date(data.date || new Date());
        const day = d.getDate();
        const month = d.toLocaleString('en-US', { month: 'long' });
        const year = d.getFullYear();
        const ordinal = getOrdinalNum(day);

        // Manual date string to match unified format
        const fullDateStr = formatDate(data.date);

        const sigs = data.signatories || [
            { name: data.issuer || 'Authorized Signatory', title: 'Position' }
        ];

        return `
            <div class="certificate-container design-official-recognition design-${data.design}">
                <div class="official-header">
                    <div class="cert-header-logos">
                        <img src="logo_pdrrmc.jpg" alt="PDRRMC Logo" class="logo-img">
                        <img src="logo_ocd.jpg" alt="OCD Logo" class="logo-img">
                        <img src="logo_davao.jpg" alt="Province Logo" class="logo-img">
                    </div>
                </div>
                <div class="official-body-container">
                    <div class="official-left-content" style="flex: 1; padding: 5rem 6rem; background: #fff;">
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
                        
                        <p class="official-venue-info">Held on <strong>${fullDateStr}</strong> at <strong>${data.venue || 'Provincial Capitol'}</strong>.</p>
                        <p class="official-date-info">Given this ${day}${ordinal} day of ${month} ${year}</p>
                        
                        <div class="official-footer-signatories">
                            ${sigs.filter(s => s && s.name && s.name.trim() !== '').map(sig => `
                                <div class="official-signatory">
                                    <div class="official-sig-line"></div>
                                    <p class="official-sig-name">${sig.name}</p>
                                    <p class="official-sig-title">${sig.title}</p>
                                </div>
                            `).join('')}
                        </div>
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

    // Filter and Sort logic
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
