// ==UserScript==
// @name         Follow.is Enhancements: Horizontal Scroll and Column Toggle
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Enable horizontal scrolling and toggle visibility of first two columns on Follow.is
// @match        https://web.follow.is/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    const styles = `
        html, body {
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
        }
        #root {
            width: max-content !important;
            min-width: 100% !important;
        }
        .column-toggle {
            position: fixed;
            top: 10px;
            left: 10px;
            z-index: 9999;
            background: #ff5c00; // 橘黄色
            color: white;
            border: none;
            border-radius: var(--radius, .5rem);
            padding: 5px 10px;
            cursor: pointer;
            font-family: var(--fo-font-family, "SN Pro", system-ui, sans-serif);
            font-size: 14px;
        }
        .hidden-column {
            display: none !important;
        }
    `;

    function addStyles() {
        const styleElement = document.createElement('style');
        styleElement.textContent = styles;
        document.head.appendChild(styleElement);
    }

    function createToggleButton() {
        const button = document.createElement('button');
        button.textContent = 'Toggle Columns';
        button.className = 'column-toggle';
        document.body.appendChild(button);
        return button;
    }

    function getColumns() {
        const flexContainer = document.querySelector('.flex.h-screen.overflow-hidden');
        if (!flexContainer) return null;

        const columns = flexContainer.children;
        return columns.length >= 3 ? Array.from(columns) : null;
    }

    function toggleColumns(columns) {
        if (!columns || columns.length < 3) return;

        columns[0].classList.toggle('hidden-column');
        columns[1].classList.toggle('hidden-column');

        const mainContent = columns[2].querySelector('main');
        if (mainContent) {
            if (columns[0].classList.contains('hidden-column')) {
                mainContent.style.width = '100%';
                mainContent.style.flexGrow = '1';
            } else {
                mainContent.style.width = '';
                mainContent.style.flexGrow = '';
            }
        }

        window.dispatchEvent(new Event('resize'));
    }

    function waitForContent() {
        return new Promise((resolve) => {
            const checkContent = () => {
                const columns = getColumns();
                if (columns) {
                    resolve(columns);
                } else {
                    setTimeout(checkContent, 100);
                }
            };
            checkContent();
        });
    }

    function enableHorizontalScroll() {
        const root = document.getElementById('root');
        if (root) {
            root.style.width = Math.max(document.documentElement.clientWidth, window.innerWidth) + 'px';
        }
    }

    async function init() {
        addStyles();
        const button = createToggleButton();
        
        const columns = await waitForContent();
        
        button.addEventListener('click', function() {
            toggleColumns(columns);
        });

        // 启用水平滚动
        enableHorizontalScroll();
        window.addEventListener('resize', enableHorizontalScroll);
    }

    // 等待页面加载完成后初始化
    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }
})();
