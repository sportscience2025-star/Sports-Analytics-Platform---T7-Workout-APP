/**
 * UI Favorites — Badge & Toggle
 * Extracted from ui.js
 */
window.App = window.App || {};
// Helper: Update Favorites Badge
window.updateFavoritesBadge = function () {
    if (!window.App.getFavorites) return;
    const favoriteCount = window.App.getFavorites().length;

    // Find all favorite nav buttons (desktop/mobile)
    const navBtns = document.querySelectorAll('.nav-btn[data-view="favorites"]');
    navBtns.forEach(navBtn => {
        // Remove existing badge
        const existingBadge = navBtn.querySelector('.nav-badge');
        if (existingBadge) existingBadge.remove();

        // Add new badge if count > 0
        if (favoriteCount > 0) {
            const badge = document.createElement('span');
            badge.className = 'nav-badge';
            badge.textContent = favoriteCount;
            navBtn.appendChild(badge);
        }
    });
};
