// ==UserScript==
// @name         Grade Average Calculator
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Calculate and display weighted grade averages next to subject names
// @author       rszczotka
// @match        https://*.mobidziennik.pl/dziennik/oceny*
// @grant        none
// ==/UserScript==
(function() {
    'use strict';

    function calculateAverages() {
        const subjectRows = document.querySelectorAll('tr.naglowek3');

        subjectRows.forEach(row => {
            const subjectNameCell = row.querySelector('td:first-child');
            const gradesCell = row.querySelector('td:nth-child(2)');

            if (!gradesCell || !gradesCell.textContent.trim()) {
                return;
            }

            const gradeLinks = gradesCell.querySelectorAll('a.info');

            if (gradeLinks.length === 0) {
                return; 
            }

            let totalWeightedValue = 0;
            let totalWeight = 0;

            gradeLinks.forEach(gradeLink => {
                const infoSpan = gradeLink.querySelector('span');

                if (!infoSpan) {
                    return;
                }

                const valueMatch = infoSpan.innerHTML.match(/Wartość oceny: <strong>([0-9.]+)<\/strong>/);
                if (!valueMatch) {
                    return; 
                }

                const gradeValue = parseFloat(valueMatch[1]);

                if (gradeValue === 0) {
                    return;
                }

                const countsTowardsAverage = infoSpan.innerHTML.includes('Liczona do średniej: <strong>tak');

                if (!countsTowardsAverage) {
                    return;
                }

                const weightMatch = infoSpan.innerHTML.match(/Waga: <strong>.*?<small>\(([0-9]+)\)<\/small>/);
                if (!weightMatch) {
                    return; 
                }

                const weight = parseInt(weightMatch[1], 10);

                if (weight === 0) {
                    return;
                }

                totalWeightedValue += gradeValue * weight;
                totalWeight += weight;
            });

            if (totalWeight > 0) {
                const average = totalWeightedValue / totalWeight;

                const formattedAverage = average.toFixed(2);

                let averageSpan = subjectNameCell.querySelector('[data-grade-average="true"]');

                if (!averageSpan) {
                    averageSpan = document.createElement('span');
                    averageSpan.setAttribute('data-grade-average', 'true');
                    averageSpan.style.color = 'rgb(27, 142, 39)';
                    averageSpan.style.fontWeight = 'bold';
                    averageSpan.style.marginRight = '10px';

                    const subjectNameDiv = subjectNameCell.querySelector('div');
                    if (subjectNameDiv) {
                        subjectNameDiv.insertBefore(averageSpan, subjectNameDiv.firstChild);
                    }
                }

                averageSpan.textContent = `[${formattedAverage}]`;
            } else {
                let averageSpan = subjectNameCell.querySelector('[data-grade-average="true"]');

                if (!averageSpan) {
                    averageSpan = document.createElement('span');
                    averageSpan.setAttribute('data-grade-average', 'true');
                    averageSpan.style.color = 'rgb(27, 142, 39)';
                    averageSpan.style.fontWeight = 'bold';
                    averageSpan.style.marginRight = '10px';

                    const subjectNameDiv = subjectNameCell.querySelector('div');
                    if (subjectNameDiv) {
                        subjectNameDiv.insertBefore(averageSpan, subjectNameDiv.firstChild);
                    }
                }

                averageSpan.textContent = '[0]';
            }
        });
    }

    window.addEventListener('load', calculateAverages);

    setTimeout(calculateAverages, 1000);
})();
