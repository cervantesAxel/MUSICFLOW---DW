async function loadPartial(url) {
    try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`No se pudo cargar ${url}: ${res.status}`);
        return await res.text();
    } catch (err) {
        console.error(err);
        return `<div class="text-danger">Error cargando plantilla: ${url}</div>`;
    }
}

async function initPartials() {
    const sidebarPlaceholder = document.getElementById('sidebar-placeholder');

    const [sidebarHtml] = await Promise.all([
        loadPartial('/partials/sidebar.html'),
    ]);

    if (sidebarPlaceholder) sidebarPlaceholder.innerHTML = sidebarHtml;

    document.dispatchEvent(new CustomEvent('partialsLoaded'));
}

document.addEventListener('DOMContentLoaded', initPartials);