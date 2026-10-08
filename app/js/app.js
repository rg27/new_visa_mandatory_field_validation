const SIZES = {
    collapsed: { width: "250", height: "64" },
    expanded:  { width: "340", height: "400" }
};
let expanded = false;
let firstLoad = true;

function setExpanded(value) {
    expanded = value;
    document.body.classList.toggle("collapsed", !value);
    try {
        ZOHO.CRM.UI.Resize(value ? SIZES.expanded : SIZES.collapsed);
    } catch (e) { console.warn("Resize failed", e); }
}

document.getElementById("widget-header").addEventListener("click", () => setExpanded(!expanded));

ZOHO.embeddedApp.on("PageLoad", (entity) => {
    console.log("[PageLoad] payload:", entity);
    let missing = null;
    if (entity && Array.isArray(entity.missing)) missing = entity.missing;
    else if (entity && entity.data && Array.isArray(entity.data.missing)) missing = entity.data.missing;

    // Start collapsed on first load only; if the team already expanded it,
    // keep it open when the data refreshes
    if (firstLoad) { setExpanded(false); firstLoad = false; }

    render(missing || []);
});
ZOHO.embeddedApp.init();

function render(missing) {
    const list = document.getElementById("field-list");
    const empty = document.getElementById("empty-state");
    document.getElementById("pending-count").textContent = missing.length;
    document.getElementById("pending-label").textContent = missing.length === 1 ? "field pending" : "fields pending";

    if (!missing.length) {
        list.innerHTML = "";
        empty.classList.remove("hidden");
        return;
    }
    empty.classList.add("hidden");

    // Group by section, keeping original order
    const groups = {};
    missing.forEach(m => (groups[m.section] = groups[m.section] || []).push(m));

    list.innerHTML = Object.keys(groups).map(section => `
        <div class="group">
            <div class="group-title">${escapeHtml(section)} <span>${groups[section].length}</span></div>
            ${groups[section].map(f => `<div class="field-row">${escapeHtml(f.label)}</div>`).join("")}
        </div>`).join("");
}

function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : str;
    return div.innerHTML;
}