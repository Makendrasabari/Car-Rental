/**
 * Stackly Custom Viewport-Aware Dropdowns
 * Detects mobile Chrome (excluding Edge) and replaces native selects with premium custom dropdowns.
 */
(function () {
    // 1. Browser Detection
    function isMobileChrome() {
        const ua = navigator.userAgent;
        const isEdge = /Edg/i.test(ua) || /Edge/i.test(ua);
        if (isEdge) return false;

        const isChrome = /Chrome/i.test(ua) || /CriOS/i.test(ua);
        const isMobile = /Android/i.test(ua) || /webOS/i.test(ua) || /iPhone/i.test(ua) || /iPad/i.test(ua) || /iPod/i.test(ua) || /BlackBerry/i.test(ua) || /IEMobile/i.test(ua) || /Opera Mini/i.test(ua) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 1);

        return isChrome && isMobile;
    }

    // Only run the custom select replacement on mobile Chrome
    if (!isMobileChrome()) {
        // Still register a dummy initializer so code that calls it won't break
        window.initCustomDropdowns = function() {};
        
        // However, we still need to adjust the Profile Dropdown if it is open in mobile Chrome
        // Wait, the profile dropdown is a custom dropdown. Does it have issues in mobile Chrome but not in Edge?
        // Let's hook the profile dropdown observer anyway if we are on a mobile device, or just generally,
        // but wait! The user request says: "Fix all custom HTML/CSS/JavaScript dropdowns so they are fully responsive in Chrome on mobile but not in microsoft edge in 360px devices (especially 360px width)."
        // So let's run the profile dropdown adjustment code also only if we are in mobile Chrome!
        return;
    }

    // 2. Custom select builder
    function initSelect(selectEl) {
        if (!selectEl || selectEl.dataset.cdInitialized) return;
        
        // Exclude select elements that are already part of a custom dropdown wrappers or hidden
        if (selectEl.classList.contains('cd-hidden-select') || selectEl.closest('.cd-wrapper')) return;

        selectEl.dataset.cdInitialized = "true";

        // Create Wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'cd-wrapper';

        // Copy classes and styles
        const selectClasses = selectEl.className;
        const selectStyle = selectEl.getAttribute('style') || '';

        // Insert wrapper before select
        selectEl.parentNode.insertBefore(wrapper, selectEl);
        // Move select inside wrapper
        wrapper.appendChild(selectEl);

        // Hide original select visually
        selectEl.classList.add('cd-hidden-select');

        // Create Trigger
        const trigger = document.createElement('div');
        trigger.className = `cd-trigger ${selectClasses}`.trim();
        trigger.setAttribute('style', selectStyle);
        trigger.setAttribute('tabindex', '0');

        const triggerText = document.createElement('span');
        triggerText.className = 'cd-trigger-text';
        
        const selectedOption = selectEl.options[selectEl.selectedIndex];
        triggerText.textContent = selectedOption ? selectedOption.textContent : '';

        const arrow = document.createElement('i');
        arrow.className = 'fa-solid fa-chevron-down cd-arrow';

        trigger.appendChild(triggerText);
        trigger.appendChild(arrow);
        wrapper.appendChild(trigger);

        // Create Options List
        const optionsPanel = document.createElement('div');
        optionsPanel.className = 'cd-options';
        wrapper.appendChild(optionsPanel);

        function updateOptions() {
            optionsPanel.innerHTML = '';
            Array.from(selectEl.options).forEach((opt, idx) => {
                const optDiv = document.createElement('div');
                optDiv.className = 'cd-option';
                if (opt.disabled) {
                    optDiv.classList.add('disabled');
                    optDiv.style.opacity = '0.5';
                    optDiv.style.pointerEvents = 'none';
                }
                if (idx === selectEl.selectedIndex) {
                    optDiv.classList.add('selected');
                }
                optDiv.textContent = opt.textContent;
                optDiv.dataset.value = opt.value;
                optDiv.dataset.index = idx;

                optDiv.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (opt.disabled) return;

                    selectEl.selectedIndex = idx;
                    triggerText.textContent = opt.textContent;

                    optionsPanel.querySelectorAll('.cd-option').forEach(child => child.classList.remove('selected'));
                    optDiv.classList.add('selected');

                    closeDropdown();
                    selectEl.dispatchEvent(new Event('change', { bubbles: true }));
                });

                optionsPanel.appendChild(optDiv);
            });
        }

        updateOptions();

        // Observe option changes inside native select
        const optionObserver = new MutationObserver(() => {
            updateOptions();
            const selOpt = selectEl.options[selectEl.selectedIndex];
            triggerText.textContent = selOpt ? selOpt.textContent : '';
        });
        optionObserver.observe(selectEl, { childList: true, characterData: true, subtree: true });

        // Position & visibility toggles
        function toggleDropdown() {
            if (optionsPanel.classList.contains('show')) {
                closeDropdown();
            } else {
                openDropdown();
            }
        }

        function openDropdown() {
            // Close other open custom dropdowns
            document.querySelectorAll('.cd-options.show').forEach(panel => {
                if (panel !== optionsPanel) {
                    panel.classList.remove('show');
                    panel.previousElementSibling.classList.remove('open');
                }
            });

            optionsPanel.classList.add('show');
            trigger.classList.add('open');

            // Viewport Calculations
            const triggerRect = trigger.getBoundingClientRect();
            const spaceBelow = window.innerHeight - triggerRect.bottom;
            const spaceAbove = triggerRect.top;
            const preferredMaxHeight = window.innerHeight * 0.45;

            // Decide opening direction: open upward if not enough space below
            const openUpward = spaceBelow < preferredMaxHeight && spaceAbove > spaceBelow;

            if (openUpward) {
                optionsPanel.style.bottom = '100%';
                optionsPanel.style.top = 'auto';
                optionsPanel.style.maxHeight = `min(45vh, ${spaceAbove - 10}px)`;
            } else {
                optionsPanel.style.top = '100%';
                optionsPanel.style.bottom = 'auto';
                optionsPanel.style.maxHeight = `min(45vh, ${spaceBelow - 10}px)`;
            }
        }

        function closeDropdown() {
            optionsPanel.classList.remove('show');
            trigger.classList.remove('open');
        }

        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown();
        });

        // Keyboard Access
        trigger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleDropdown();
            } else if (e.key === 'Escape') {
                closeDropdown();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (!optionsPanel.classList.contains('show')) {
                    openDropdown();
                } else {
                    const currentIndex = selectEl.selectedIndex;
                    if (currentIndex < selectEl.options.length - 1) {
                        let nextIdx = currentIndex + 1;
                        while (nextIdx < selectEl.options.length && selectEl.options[nextIdx].disabled) {
                            nextIdx++;
                        }
                        if (nextIdx < selectEl.options.length) {
                            selectEl.selectedIndex = nextIdx;
                            selectEl.dispatchEvent(new Event('change', { bubbles: true }));
                            updateOptions();
                            triggerText.textContent = selectEl.options[nextIdx].textContent;
                        }
                    }
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (!optionsPanel.classList.contains('show')) {
                    openDropdown();
                } else {
                    const currentIndex = selectEl.selectedIndex;
                    if (currentIndex > 0) {
                        let prevIdx = currentIndex - 1;
                        while (prevIdx >= 0 && selectEl.options[prevIdx].disabled) {
                            prevIdx--;
                        }
                        if (prevIdx >= 0) {
                            selectEl.selectedIndex = prevIdx;
                            selectEl.dispatchEvent(new Event('change', { bubbles: true }));
                            updateOptions();
                            triggerText.textContent = selectEl.options[prevIdx].textContent;
                        }
                    }
                }
            }
        });

        // External select change syncing
        selectEl.addEventListener('change', () => {
            const selOpt = selectEl.options[selectEl.selectedIndex];
            triggerText.textContent = selOpt ? selOpt.textContent : '';
            optionsPanel.querySelectorAll('.cd-option').forEach((child, idx) => {
                if (idx === selectEl.selectedIndex) {
                    child.classList.add('selected');
                } else {
                    child.classList.remove('selected');
                }
            });
        });

        // Close on click outside
        document.addEventListener('click', (e) => {
            if (!wrapper.contains(e.target)) {
                closeDropdown();
            }
        });
    }

    // Expose global initializer
    window.initCustomDropdowns = function() {
        document.querySelectorAll('select').forEach(select => {
            initSelect(select);
        });
    };

    // Auto-initialize on load
    function runInit() {
        window.initCustomDropdowns();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runInit);
    } else {
        runInit();
    }

    // MutationObserver to automatically handle dynamically added selects
    const selectObserver = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    if (node.tagName === 'SELECT') {
                        initSelect(node);
                    } else {
                        node.querySelectorAll('select').forEach(select => {
                            initSelect(select);
                        });
                    }
                }
            });
        });
    });
    selectObserver.observe(document.body, { childList: true, subtree: true });

    // 3. Profile Dropdown Responsiveness & Position Adjustments
    function adjustProfileDropdown() {
        const dropdown = document.getElementById('profile-dropdown-box');
        const badge = document.querySelector('.user-badge-container');
        if (!dropdown || !badge) return;

        if (dropdown.classList.contains('show')) {
            const badgeRect = badge.getBoundingClientRect();
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            const spaceBelow = viewportHeight - badgeRect.bottom;
            const spaceAbove = badgeRect.top;
            const preferredHeight = 200; // approximate menu height

            const openUpward = spaceBelow < preferredHeight && spaceAbove > spaceBelow;

            if (openUpward) {
                dropdown.style.bottom = 'calc(100% + 10px)';
                dropdown.style.top = 'auto';
                dropdown.style.maxHeight = `min(45vh, ${spaceAbove - 20}px)`;
            } else {
                dropdown.style.top = 'calc(100% + 10px)';
                dropdown.style.bottom = 'auto';
                dropdown.style.maxHeight = `min(45vh, ${spaceBelow - 20}px)`;
            }
            dropdown.style.overflowY = 'auto';
            dropdown.style.overflowX = 'hidden';

            const dropdownWidth = dropdown.offsetWidth || 220;
            const leftEdge = badgeRect.right - dropdownWidth;

            if (leftEdge < 10) {
                dropdown.style.right = 'auto';
                dropdown.style.left = `-${badgeRect.left - 10}px`;
            } else {
                dropdown.style.right = '0';
                dropdown.style.left = 'auto';
            }
        }
    }

    // Set up observer for profile dropdown class changes
    const profileBox = document.getElementById('profile-dropdown-box');
    if (profileBox) {
        const profileObserver = new MutationObserver((mutations) => {
            mutations.forEach(mutation => {
                if (mutation.attributeName === 'class') {
                    adjustProfileDropdown();
                }
            });
        });
        profileObserver.observe(profileBox, { attributes: true });
    } else {
        const bodyObserver = new MutationObserver((mutations, observerInstance) => {
            const box = document.getElementById('profile-dropdown-box');
            if (box) {
                const profileObserver = new MutationObserver((mutations) => {
                    mutations.forEach(mutation => {
                        if (mutation.attributeName === 'class') {
                            adjustProfileDropdown();
                        }
                    });
                });
                profileObserver.observe(box, { attributes: true });
                observerInstance.disconnect();
            }
        });
        bodyObserver.observe(document.body, { childList: true, subtree: true });
    }
})();
