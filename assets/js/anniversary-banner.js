/**
 * @fileoverview One-day announcement banner: ACT Science Centre 1st anniversary
 *               and Thanksgiving event.
 * @description Shows a banner (and reveals #thanksgiving on index.html) only on
 *              the event day, in Indian Standard Time. On any other day this
 *              script does nothing, so it expires by itself.
 *
 *              To reuse for another event, edit EVENT below.
 */
(function () {
    'use strict';

    var EVENT = {
        date: '2026-11-15',              // YYYY-MM-DD, evaluated in IST
        timeZone: 'Asia/Kolkata',
        headline: '1 Year of ACT Science Centre',
        message: 'Thanksgiving Celebration TODAY at 4 PM · ACT Science Centre',
        shortMessage: 'Thanksgiving TODAY · 4 PM',
        linkText: 'Join us',
        linkHref: 'index.html#thanksgiving'
    };

    var STORAGE_KEY = 'vcs-banner-dismissed-' + EVENT.date;

    function isEventDay() {
        try {
            return new Date().toLocaleDateString('en-CA', { timeZone: EVENT.timeZone }) === EVENT.date;
        } catch (e) {
            return false;
        }
    }

    function wasDismissed() {
        try { return sessionStorage.getItem(STORAGE_KEY) === '1'; } catch (e) { return false; }
    }

    function rememberDismissed() {
        try { sessionStorage.setItem(STORAGE_KEY, '1'); } catch (e) { /* storage unavailable */ }
    }

    function el(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text) node.textContent = text;
        return node;
    }

    function revealSpotlight() {
        var section = document.getElementById('thanksgiving');
        if (section) section.classList.remove('hidden');
    }

    function addStyles() {
        var style = document.createElement('style');
        style.textContent =
            '#navbar{margin-top:var(--nav-offset,0px)}' +
            '#event-banner .eb-msg-short{display:inline}#event-banner .eb-msg-long{display:none}' +
            '@media(min-width:640px){#event-banner .eb-msg-short{display:none}#event-banner .eb-msg-long{display:inline}}' +
            '@keyframes eb-in{from{opacity:0;transform:translateY(-100%)}to{opacity:1;transform:none}}' +
            '#event-banner{animation:eb-in .5s ease-out}' +
            '@media(prefers-reduced-motion:reduce){#event-banner{animation:none}}';
        document.head.appendChild(style);
    }

    function buildBanner() {
        var banner = el('div', 'relative z-40 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-blue-900');
        banner.id = 'event-banner';
        banner.setAttribute('role', 'region');
        banner.setAttribute('aria-label', 'Event announcement');

        var inner = el('div', 'container mx-auto px-10 py-2 text-center text-xs sm:text-sm font-semibold leading-snug');
        inner.appendChild(el('span', '', '🎉 '));
        inner.appendChild(el('strong', 'font-bold', EVENT.headline + ' — '));
        inner.appendChild(el('span', 'eb-msg-long', EVENT.message));
        inner.appendChild(el('span', 'eb-msg-short', EVENT.shortMessage));

        var link = el('a', 'ml-2 underline underline-offset-2 font-bold hover:text-blue-700 whitespace-nowrap', EVENT.linkText + ' →');
        link.href = EVENT.linkHref;
        inner.appendChild(link);
        banner.appendChild(inner);

        var close = el('button', 'absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full text-lg leading-none hover:bg-blue-900/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-900', '×');
        close.type = 'button';
        close.setAttribute('aria-label', 'Dismiss announcement');
        banner.appendChild(close);

        return { banner: banner, close: close };
    }

    function init() {
        if (!isEventDay()) return;

        revealSpotlight();
        if (wasDismissed() || document.getElementById('event-banner')) return;

        addStyles();
        var parts = buildBanner();
        var banner = parts.banner;
        document.body.insertBefore(banner, document.body.firstChild);

        // The navbar is position:fixed; keep it below the banner until the banner scrolls away.
        function syncNavOffset() {
            var h = banner.isConnected ? banner.offsetHeight : 0;
            var offset = Math.max(0, h - (window.pageYOffset || 0));
            document.documentElement.style.setProperty('--nav-offset', offset + 'px');
        }
        window.addEventListener('scroll', syncNavOffset, { passive: true });
        window.addEventListener('resize', syncNavOffset);
        syncNavOffset();

        function dismiss() {
            rememberDismissed();
            banner.remove();
            window.removeEventListener('scroll', syncNavOffset);
            window.removeEventListener('resize', syncNavOffset);
            document.documentElement.style.removeProperty('--nav-offset');
        }
        parts.close.addEventListener('click', dismiss);
        banner.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') dismiss();
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
