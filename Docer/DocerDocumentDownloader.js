// ==UserScript==
// @name         Docer Document Downloader (Multi-site)
// @namespace    http://tampermonkey.net/
// @version      3
// @description  Intercepts document URLs and overrides default download button
// @author       rszczotka
// @match        https://docer.pl/*
// @match        https://docer.com.ar/*
// @match        https://docer.ar/*
// @match        https://doceru.com/*
// @match        https://docero.de/*
// @grant        GM_log
// ==/UserScript==

(function() {
    'use strict';

    const SUPPORTED_DOMAINS = ['docer.pl', 'docer.com.ar', 'docer.ar', 'doceru.com', 'docero.de'];

    function debug(message) {
        GM_log('[Docer Debug] ' + message);
        console.log('[Docer Debug] ' + message);
    }

    function updateDownloadButton(pdfUrl) {
        const btn = document.getElementById('dwn_btn');
        if (!btn) return;

        const infoText = document.createElement('div');
        infoText.textContent = 'Działa, pozdrowionka';
        infoText.style.textAlign = 'center';
        infoText.style.marginTop = '6px';
        infoText.style.color = '#0eab00';
        btn.parentNode.insertBefore(infoText, btn.nextSibling);

        btn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            window.location.href = pdfUrl;
        });
    }

    const originalOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function() {
        const url = arguments[1];
        debug('XHR request intercepted: ' + url);

        if (url.includes('/start/show')) {
            this.addEventListener('load', function() {
                if (this.responseType === '' || this.responseType === 'text') {
                    try {
                        const data = JSON.parse(this.responseText);
                        if (data.response && data.response.url) {
                            updateDownloadButton(data.response.url);
                        }
                    } catch (e) {
                        debug('Error parsing JSON: ' + e.message);
                    }
                }
            });
        }
        return originalOpen.apply(this, arguments);
    };

    debug('Docer PDF Downloader script is active');
})();
