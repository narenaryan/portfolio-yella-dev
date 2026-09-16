(() => {
    const gallery = document.querySelector('[data-photo-gallery]');
    if (!gallery) return;
    const links = Array.from(gallery.querySelectorAll('[data-photo-link]'));
    const viewer = gallery.querySelector('[data-photo-viewer]');
    if (!viewer || typeof viewer.showModal !== 'function') return;

    const image = viewer.querySelector('[data-viewer-image]');
    const caption = viewer.querySelector('[data-viewer-caption]');
    const count = viewer.querySelector('[data-viewer-count]');
    const previous = viewer.querySelector('[data-viewer-prev]');
    const next = viewer.querySelector('[data-viewer-next]');
    const fit = viewer.querySelector('[data-viewer-fit]');
    let active = 0;
    let opener;

    const show = (index) => {
        active = Math.max(0, Math.min(index, links.length - 1));
        const link = links[active];
        image.src = link.href;
        image.alt = link.querySelector('img').alt;
        caption.textContent = link.closest('figure').querySelector('[data-photo-caption]').textContent;
        count.textContent = `${String(active + 1).padStart(2, '0')} / ${links.length}`;
        previous.disabled = active === 0;
        next.disabled = active === links.length - 1;
    };

    links.forEach((link, index) => {
        link.addEventListener('click', (event) => {
            if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
            event.preventDefault();
            opener = link;
            show(index);
            viewer.showModal();
        });
    });
    previous.addEventListener('click', () => show(active - 1));
    next.addEventListener('click', () => show(active + 1));
    fit.addEventListener('click', () => {
        const fitted = viewer.classList.toggle('photo-viewer--fit');
        fit.setAttribute('aria-pressed', String(fitted));
        fit.textContent = fitted ? 'Fill screen' : 'Show full photo';
    });
    viewer.querySelector('[data-viewer-close]').addEventListener('click', () => viewer.close());
    viewer.addEventListener('close', () => opener?.focus({ preventScroll: true }));
    viewer.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            show(active + (event.key === 'ArrowRight' ? 1 : -1));
        }
    });
})();
