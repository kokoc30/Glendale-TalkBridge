// TalkBridge — Clinic Mode
// Frontend-only web app for clinic captions and translation demo

// Configuration constants
const CONFIG = {
    DEMO_INTERVAL_MIN: 3000,  // 3 seconds
    DEMO_INTERVAL_MAX: 3000,  // 3 seconds
    HISTORY_LIMIT: 20,
    CUSTOMER_VIEW_LIMIT: 5,
    FONT_SIZE_MIN: 24,
    FONT_SIZE_MAX: 96,
    FONT_SIZE_DEFAULT: 72
};

// Application state
let state = {
    // Demo state
    running: false,
    paused: false,
    demoInterval: null,
    currentDemoIndex: 0,
    
    // Language and translation
    targetLang: 'es',
    translateOn: true,
    
    // Display settings
    fontSizePx: CONFIG.FONT_SIZE_DEFAULT,
    highContrast: false,
    translitOn: false,
    online: true,
    
    // Data
    demoData: [],
    history: [],
    
    // UI state
    currentTab: 'clerk',
    exportConsent: false
};

// DOM elements cache
const elements = {};

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Cache DOM elements
        cacheElements();
        
        // Load sample data
        loadSampleData();
        
        // Initialize UI
        initializeUI();
        
        // Set up event listeners
        setupEventListeners();
        
        // Initialize keyboard shortcuts
        setupKeyboardShortcuts();
        
        console.log('TalkBridge — Clinic Mode initialized successfully');
    } catch (error) {
        console.error('Failed to initialize application:', error);
        showError('Failed to load application. Please refresh the page.');
    }
});

// Cache frequently used DOM elements
function cacheElements() {
    elements.statusChip = document.getElementById('statusChip');
    elements.micButton = document.getElementById('micButton');
    elements.translateToggle = document.getElementById('translateToggle');
    elements.playDemo = document.getElementById('playDemo');
    elements.pauseDemo = document.getElementById('pauseDemo');
    elements.rewindDemo = document.getElementById('rewindDemo');
    elements.clearDemo = document.getElementById('clearDemo');
    elements.exportButton = document.getElementById('exportButton');
    elements.sourceLine = document.getElementById('sourceLine');
    elements.targetLine = document.getElementById('targetLine');
    elements.historyArea = document.getElementById('historyArea');
    elements.fontSizeSlider = document.getElementById('fontSizeSlider');
    elements.fontSizeValue = document.getElementById('fontSizeValue');
    elements.customerPause = document.getElementById('customerPause');
    elements.customerRewind = document.getElementById('customerRewind');
    elements.fullscreenButton = document.getElementById('fullscreenButton');
    elements.bigSourceLine = document.getElementById('bigSourceLine');
    elements.bigTargetLine = document.getElementById('bigTargetLine');
    elements.bigTextArea = document.getElementById('bigTextArea');
    elements.consentModal = document.getElementById('consentModal');
    elements.consentAccept = document.getElementById('consentAccept');
    elements.consentCancel = document.getElementById('consentCancel');
    elements.highContrastToggle = document.getElementById('highContrastToggle');
    elements.translitToggle = document.getElementById('translitToggle');
    elements.offlineToggle = document.getElementById('offlineToggle');
}

// Demo data embedded directly in JavaScript - Clinic demo sentences
const DEMO_DATA = [
    {
        en: "Hello, how can I help you today?",
        es: "Hola, ¿cómo puedo ayudarle hoy?",
        hy: "Բարև ձեզ, ինչպե՞ս կարող եմ օգնել ձեզ այսօր։",
        hy_latn: "Barev dzez, inchpēs karam ognel dzez aysor?"
    },
    {
        en: "Do you have any allergies?",
        es: "¿Tiene alergias?",
        hy: "Ալերգիաներ ունե՞ք։",
        hy_latn: "Alergianer unek'?"
    },
    {
        en: "Please wait one moment.",
        es: "Por favor, espere un momento.",
        hy: "Խնդրում եմ, սպասեք մեկ րոպե։",
        hy_latn: "Khndrum em, spasek' mek rope."
    },
    {
        en: "Your name and date of birth, please.",
        es: "Su nombre y fecha de nacimiento, por favor.",
        hy: "Խնդրում եմ, ձեր անունը և ծննդյան օրը։",
        hy_latn: "Khndrum em, dzer anuny yev tsnndyan orë."
    },
    {
        en: "Do you need an interpreter today?",
        es: "¿Necesita un intérprete hoy?",
        hy: "Այսօր թարգմանիչ անհրաժեշտ է՞։",
        hy_latn: "Aysor targmanich anhrajesht e?"
    }
];

// Load sample data
function loadSampleData() {
    state.demoData = DEMO_DATA;
    
    console.log(`Loaded ${state.demoData.length} demo lines`);
    console.log('Demo data:', state.demoData);
    
    // Test the data
    state.demoData.forEach((line, index) => {
        console.log(`Line ${index + 1}: ${line.en}`);
    });
}

// Initialize UI components
function initializeUI() {
    // Initialize status chip
    updateStatusChip();
    
    // Initialize language buttons
    updateLanguageButtons();
    
    
    // Initialize font size
    updateFontSize();
    
    // Apply font size to any existing big text content
    const bigTextContent = document.querySelectorAll('.big-text-content');
    bigTextContent.forEach(element => {
        element.style.fontSize = `${state.fontSizePx}px`;
    });
    
    // Initialize settings
    updateSettingsUI();
    
    // Initialize transcript areas
    clearTranscripts();
    
    // Set translation toggle to ON by default
    elements.translateToggle.setAttribute('aria-pressed', 'true');
    elements.translateToggle.querySelector('span').textContent = 'On';
    elements.targetLine.style.display = 'block';
    elements.bigTargetLine.style.display = 'block';
}

// Set up event listeners
function setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', (e) => switchTab(e.target.dataset.tab));
    });
    
    // Microphone button
    elements.micButton.addEventListener('click', toggleMicrophone);
    
    // Language buttons
    document.querySelectorAll('.lang-button').forEach(btn => {
        btn.addEventListener('click', (e) => setTargetLanguage(e.target.dataset.lang));
    });
    
    // Translate toggle
    elements.translateToggle.addEventListener('click', toggleTranslation);
    
    // Demo controls
    elements.playDemo.addEventListener('click', startDemo);
    elements.pauseDemo.addEventListener('click', pauseDemo);
    elements.rewindDemo.addEventListener('click', rewindDemo);
    elements.clearDemo.addEventListener('click', clearTranscripts);
    
    // Debug button removed - more demo examples added
    
    // Export button
    elements.exportButton.addEventListener('click', () => {
        if (elements.exportButton.disabled) {
            showError('Complete the demo conversation first to enable export');
            return;
        }
        downloadHistoryAsFile();
    });
    
    // Customer view controls
    elements.fontSizeSlider.addEventListener('input', updateFontSize);
    elements.customerPause.addEventListener('click', toggleCustomerPause);
    elements.customerRewind.addEventListener('click', rewindDemo);
    elements.fullscreenButton.addEventListener('click', toggleFullscreen);
    
    // Settings
    elements.highContrastToggle.addEventListener('change', toggleHighContrast);
    elements.translitToggle.addEventListener('change', toggleTransliteration);
    elements.offlineToggle.addEventListener('change', toggleOfflineMode);
    
    // Modal
    elements.consentAccept.addEventListener('click', acceptConsent);
    elements.consentCancel.addEventListener('click', hideConsentModal);
    
    // Close modal on backdrop click
    elements.consentModal.addEventListener('click', (e) => {
        if (e.target === elements.consentModal) {
            hideConsentModal();
        }
    });
}

// Set up keyboard shortcuts
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Don't trigger shortcuts when typing in inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch (e.key.toLowerCase()) {
            case ' ':
                e.preventDefault();
                toggleMicrophone();
                break;
            case '1':
                e.preventDefault();
                setTargetLanguage('en');
                break;
            case '2':
                e.preventDefault();
                setTargetLanguage('es');
                break;
            case '3':
                e.preventDefault();
                setTargetLanguage('hy');
                break;
            case 't':
                e.preventDefault();
                toggleTranslation();
                break;
            case 'p':
                e.preventDefault();
                if (state.currentTab === 'customer') {
                    toggleCustomerPause();
                } else {
                    startDemo();
                }
                break;
            case 'r':
                e.preventDefault();
                rewindDemo();
                break;
            case 'h':
                e.preventDefault();
                // Toggle history visibility (could be implemented)
                break;
            case 'f':
                e.preventDefault();
                toggleFullscreen();
                break;
            case '+':
            case '=':
                e.preventDefault();
                increaseFontSize();
                break;
            case '-':
                e.preventDefault();
                decreaseFontSize();
                break;
        }
    });
}

// Tab switching
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
        tab.setAttribute('aria-pressed', 'false');
    });
    
    const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
    activeTab.classList.add('active');
    activeTab.setAttribute('aria-pressed', 'true');
    
    // Update panels
    document.querySelectorAll('.panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    const activePanel = document.getElementById(`${tabName}-panel`);
    activePanel.classList.add('active');
    
    state.currentTab = tabName;
    
    // Update customer view if switching to it
    if (tabName === 'customer') {
        updateCustomerView();
    }
}

// Status chip management
function updateStatusChip() {
    const statusText = elements.statusChip.querySelector('.status-text');
    if (state.online) {
        elements.statusChip.className = 'status-chip online';
        statusText.textContent = 'Online';
    } else {
        elements.statusChip.className = 'status-chip offline';
        statusText.textContent = 'Offline';
    }
}

// Microphone toggle
function toggleMicrophone() {
    const isPressed = elements.micButton.getAttribute('aria-pressed') === 'true';
    elements.micButton.setAttribute('aria-pressed', !isPressed);
    
    if (isPressed) {
        elements.micButton.querySelector('span').textContent = 'Start Mic';
        elements.micButton.classList.remove('active');
    } else {
        elements.micButton.querySelector('span').textContent = 'Stop Mic';
        elements.micButton.classList.add('active');
    }
}

// Language selection
function setTargetLanguage(lang) {
    state.targetLang = lang;
    updateLanguageButtons();
    
    // Update current transcript if translation is on
    if (state.translateOn && state.history.length > 0) {
        updateCurrentTranscript();
    }
    
    // Update customer view if we're on customer tab
    if (state.currentTab === 'customer') {
        updateCustomerView();
    }
}

function updateLanguageButtons() {
    document.querySelectorAll('.lang-button').forEach(btn => {
        const isActive = btn.dataset.lang === state.targetLang;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-pressed', isActive);
    });
}

// Translation toggle
function toggleTranslation() {
    state.translateOn = !state.translateOn;
    elements.translateToggle.setAttribute('aria-pressed', state.translateOn);
    elements.translateToggle.querySelector('span').textContent = state.translateOn ? 'On' : 'Off';
    
    // Show/hide target line
    elements.targetLine.style.display = state.translateOn ? 'block' : 'none';
    elements.bigTargetLine.style.display = state.translateOn ? 'block' : 'none';
    
    // Update current transcript
    updateCurrentTranscript();
    
    // Update customer view if we're on customer tab
    if (state.currentTab === 'customer') {
        updateCustomerView();
    }
}

// Demo controls
function startDemo() {
    if (state.demoData.length === 0) {
        showError('No demo data available');
        return;
    }
    
    console.log('startDemo called - current index:', state.currentDemoIndex, 'total sentences:', state.demoData.length);
    
    // Check if we've gone through all sentences
    if (state.currentDemoIndex >= state.demoData.length) {
        showSuccess('Demo completed! All sentences shown. Click "Clear" to restart.');
        // Enable export button after demo completion
        enableExportButton();
        return;
    }
    
    // Show current sentence
    playNextDemoLine();
    
    console.log(`Showing demo sentence ${state.currentDemoIndex}/${state.demoData.length}`);
}

function pauseDemo() {
    state.paused = !state.paused;
    
    if (state.paused) {
        elements.pauseDemo.querySelector('span').textContent = 'Resume';
        elements.customerPause.querySelector('span').textContent = 'Resume';
    } else {
        elements.pauseDemo.querySelector('span').textContent = 'Pause';
        elements.customerPause.querySelector('span').textContent = 'Pause';
    }
}

// Removed stopDemo function - no longer needed with step-through demo

function playNextDemoLine() {
    console.log('playNextDemoLine called - current index:', state.currentDemoIndex);
    
    // Get the current line
    const line = state.demoData[state.currentDemoIndex];
    
    if (!line) {
        console.error('No line found at index:', state.currentDemoIndex);
        return;
    }
    
    console.log(`Playing demo line ${state.currentDemoIndex + 1}/${state.demoData.length}: ${line.en}`);
    console.log('Spanish translation:', line.es);
    console.log('Armenian translation:', line.hy);
    
    // Add to history
    addToHistory(line);
    
    // Update transcript displays
    updateTranscripts(line);
    
    // Update customer view
    updateCustomerView();
    
    // Update demo progress indicator
    updateDemoProgress();
    
    // Move to next sentence for next click AFTER showing current sentence
    state.currentDemoIndex++;
    console.log('Moved to next index:', state.currentDemoIndex);
    
    // Update button immediately to show next progress
    resetDemoButton();
}

function resetDemoButton() {
    console.log('resetDemoButton called - current index:', state.currentDemoIndex, 'total sentences:', state.demoData.length);
    
    // Reset button appearance
    elements.playDemo.disabled = false;
    
    // Update button text to show progress
    if (state.currentDemoIndex < state.demoData.length) {
        const buttonText = `Next (${state.currentDemoIndex + 1}/${state.demoData.length})`;
        elements.playDemo.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
            </svg>
            ${buttonText}
        `;
        console.log(`Button updated to: ${buttonText}`);
    } else {
        elements.playDemo.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
            </svg>
            Demo Complete
        `;
        elements.playDemo.disabled = true;
        console.log('Button updated to: Demo Complete');
    }
    
    // Force a re-render by accessing the button
    console.log('Button text after update:', elements.playDemo.textContent);
}

function rewindDemo() {
    if (state.history.length === 0) return;
    
    // Get last 5 lines from history
    const rewindCount = Math.min(5, state.history.length);
    const rewindLines = state.history.slice(-rewindCount);
    
    // Clear current transcripts
    clearTranscripts();
    
    // Show rewinded lines
    rewindLines.forEach(line => {
        updateTranscripts(line, false); // Don't add to history again
    });
    
    console.log(`Rewound ${rewindCount} lines`);
}

function clearTranscripts() {
    // Clear source and target lines
    elements.sourceLine.querySelector('.line-text').textContent = 'Ready to start...';
    elements.targetLine.style.display = 'none';
    elements.bigSourceLine.querySelector('.big-text-content').textContent = 'Ready to start...';
    elements.bigTargetLine.style.display = 'none';
    
    // Clear history
    state.history = [];
    elements.historyArea.innerHTML = '<p class="history-empty">No history yet</p>';
    
    // Reset demo state
    state.currentDemoIndex = 0;
    state.running = false;
    state.paused = false;
    
    // Stop demo if running
    if (state.demoInterval) {
        clearInterval(state.demoInterval);
        state.demoInterval = null;
    }
    
    // Reset demo button
    resetDemoButton();
    
    // Disable export button
    elements.exportButton.disabled = true;
    elements.exportButton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
        </svg>
        Export
    `;
    elements.exportButton.title = 'Export transcript (requires consent)';
    
    // Remove demo running class
    document.body.classList.remove('demo-running');
}

// Transcript management
function updateTranscripts(line, addToHistory = true) {
    if (addToHistory) {
        addToHistory(line);
    }
    
    // Add animation class for smooth transitions
    elements.sourceLine.classList.add('animating');
    if (state.translateOn) {
        elements.targetLine.classList.add('animating');
    }
    
    // Update source line
    const sourceText = line.en;
    elements.sourceLine.querySelector('.line-text').textContent = sourceText;
    
    // Update target line if translation is on
    if (state.translateOn) {
        const targetText = getTranslatedText(line);
        elements.targetLine.querySelector('.line-text').textContent = targetText;
        elements.targetLine.style.display = 'block';
    }
    
    // Remove animation class after animation completes
    setTimeout(() => {
        elements.sourceLine.classList.remove('animating');
        elements.targetLine.classList.remove('animating');
    }, 400);
}

function updateCurrentTranscript() {
    if (state.history.length === 0) return;
    
    const lastLine = state.history[state.history.length - 1];
    updateTranscripts(lastLine, false);
}

function addToHistory(line) {
    state.history.push(line);
    
    // Limit history size
    if (state.history.length > CONFIG.HISTORY_LIMIT) {
        state.history.shift();
    }
    
    // Update history display
    renderHistory();
}

function renderHistory() {
    const historyContainer = elements.historyArea;
    
    if (state.history.length === 0) {
        historyContainer.innerHTML = '<p class="history-empty">No history yet</p>';
        return;
    }
    
    // Show last 5 lines
    const recentHistory = state.history.slice(-5);
    
    historyContainer.innerHTML = recentHistory.map((line, index) => {
        const sourceText = line.en;
        const targetText = state.translateOn ? getTranslatedText(line) : '';
        
        return `
            <div class="history-line">
                <div class="history-source">${sourceText}</div>
                ${targetText ? `<div class="history-target">${targetText}</div>` : ''}
            </div>
        `;
    }).join('');
}

// Customer view management
function updateCustomerView() {
    if (state.history.length === 0) return;
    
    // Show last few lines
    const recentLines = state.history.slice(-CONFIG.CUSTOMER_VIEW_LIMIT);
    const lastLine = recentLines[recentLines.length - 1];
    
    // Add animation class for smooth transitions
    elements.bigSourceLine.classList.add('animating');
    elements.bigTargetLine.classList.add('animating');
    
    // In customer view, show only the target language when translation is on
    if (state.translateOn) {
        // Hide source line, show only target
        elements.bigSourceLine.style.display = 'none';
        elements.bigTargetLine.style.display = 'block';
        
        // Show the selected target language
        const targetText = getTranslatedText(lastLine);
        elements.bigTargetLine.querySelector('.big-text-content').textContent = targetText;
        
        // Update the target label to show current language
        const targetLabel = elements.bigTargetLine.querySelector('.big-text-label');
        const langNames = { 'en': 'English', 'es': 'Spanish', 'hy': 'Armenian' };
        targetLabel.textContent = `${langNames[state.targetLang]}:`;
    } else {
        // Show only English source when translation is off
        elements.bigSourceLine.style.display = 'block';
        elements.bigTargetLine.style.display = 'none';
        
        elements.bigSourceLine.querySelector('.big-text-content').textContent = lastLine.en;
        const sourceLabel = elements.bigSourceLine.querySelector('.big-text-label');
        sourceLabel.textContent = 'English:';
    }
    
    // Apply current font size to the updated content
    updateFontSize();
    
    // Remove animation class after animation completes
    setTimeout(() => {
        elements.bigSourceLine.classList.remove('animating');
        elements.bigTargetLine.classList.remove('animating');
    }, 600);
}

// Font size management
function updateFontSize() {
    state.fontSizePx = parseInt(elements.fontSizeSlider.value);
    elements.fontSizeValue.textContent = `${state.fontSizePx}pt`;
    
    // Apply font size to big text content specifically
    const bigTextContent = elements.bigTextArea.querySelectorAll('.big-text-content');
    bigTextContent.forEach(element => {
        element.style.fontSize = `${state.fontSizePx}px`;
        element.style.transition = 'font-size 0.3s ease'; // Smooth transition
    });
    
    // Add visual feedback
    elements.fontSizeValue.style.transform = 'scale(1.1)';
    setTimeout(() => {
        elements.fontSizeValue.style.transform = 'scale(1)';
    }, 200);
    
    console.log(`Font size updated to ${state.fontSizePx}px`);
}

function increaseFontSize() {
    const newSize = Math.min(state.fontSizePx + 6, CONFIG.FONT_SIZE_MAX);
    elements.fontSizeSlider.value = newSize;
    updateFontSize();
}

function decreaseFontSize() {
    const newSize = Math.max(state.fontSizePx - 6, CONFIG.FONT_SIZE_MIN);
    elements.fontSizeSlider.value = newSize;
    updateFontSize();
}

// Customer view controls
function toggleCustomerPause() {
    startDemo();
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
            console.error('Error attempting to enable fullscreen:', err);
        });
    } else {
        document.exitFullscreen().catch(err => {
            console.error('Error attempting to exit fullscreen:', err);
        });
    }
}


// Demo progress indicator
function updateDemoProgress() {
    const progressText = `Demo: ${state.currentDemoIndex + 1}/${state.demoData.length}`;
    console.log(progressText);
    
    // Add progress indicator to the page
    let progressIndicator = document.getElementById('demo-progress');
    if (!progressIndicator) {
        progressIndicator = document.createElement('div');
        progressIndicator.id = 'demo-progress';
        progressIndicator.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px;
            border-radius: 5px;
            z-index: 9999;
            font-family: monospace;
        `;
        document.body.appendChild(progressIndicator);
    }
    progressIndicator.textContent = `Sentence ${state.currentDemoIndex + 1} of ${state.demoData.length}`;
}

// Translation logic
function getTranslatedText(line) {
    if (state.targetLang === 'en') {
        return line.en;
    } else if (state.targetLang === 'es') {
        return line.es;
    } else if (state.targetLang === 'hy') {
        return state.translitOn ? line.hy_latn : line.hy;
    }
    return line.en;
}

// Export functionality
function enableExportButton() {
    elements.exportButton.disabled = false;
    elements.exportButton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
        </svg>
        Download History
    `;
    elements.exportButton.title = 'Download conversation history as file';
    showSuccess('Export button enabled - you can now download the conversation history!');
}

function showConsentModal() {
    elements.consentModal.setAttribute('aria-hidden', 'false');
    elements.consentModal.style.display = 'flex';
}

function hideConsentModal() {
    elements.consentModal.setAttribute('aria-hidden', 'true');
    elements.consentModal.style.display = 'none';
}

function acceptConsent() {
    state.exportConsent = true;
    elements.exportButton.disabled = false;
    elements.exportButton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
        </svg>
        Download History
    `;
    elements.exportButton.title = 'Download conversation history as file';
    
    hideConsentModal();
    
    // Actually download the file
    downloadHistoryAsFile();
}

function downloadHistoryAsFile() {
    if (state.history.length === 0) {
        showError('No history to export');
        return;
    }
    
    const linesToExport = state.history.slice(-20);
    const exportText = linesToExport.map((line, index) => {
        const sourceText = line.en;
        const targetText = state.translateOn ? getTranslatedText(line) : '';
        
        let result = `${index + 1}. ${sourceText}`;
        if (targetText) {
            result += `\n   → ${targetText}`;
        }
        return result;
    }).join('\n\n');
    
    // Add header with timestamp and language info
    const header = `TalkBridge - Clinic Mode Conversation History
Generated: ${new Date().toLocaleString()}
Language: ${state.targetLang.toUpperCase()}
Translation: ${state.translateOn ? 'ON' : 'OFF'}
Total Lines: ${linesToExport.length}

`;
    
    const fullText = header + exportText;
    
    // Create and download file
    const blob = new Blob([fullText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `talkbridge-conversation-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showSuccess('Conversation history downloaded successfully!');
}

// Keep the old clipboard function for backward compatibility
function copyHistoryToClipboard() {
    if (state.history.length === 0) {
        showError('No history to export');
        return;
    }
    
    const linesToExport = state.history.slice(-20);
    const exportText = linesToExport.map((line, index) => {
        const sourceText = line.en;
        const targetText = state.translateOn ? getTranslatedText(line) : '';
        
        let result = `${index + 1}. ${sourceText}`;
        if (targetText) {
            result += `\n   → ${targetText}`;
        }
        return result;
    }).join('\n\n');
    
    navigator.clipboard.writeText(exportText).then(() => {
        showSuccess('History copied to clipboard!');
    }).catch(err => {
        console.error('Failed to copy to clipboard:', err);
        showError('Failed to copy to clipboard');
    });
}

// Settings management
function updateSettingsUI() {
    elements.highContrastToggle.checked = state.highContrast;
    elements.translitToggle.checked = state.translitOn;
    elements.offlineToggle.checked = !state.online;
}

function toggleHighContrast() {
    state.highContrast = elements.highContrastToggle.checked;
    document.body.classList.toggle('high-contrast', state.highContrast);
}

function toggleTransliteration() {
    state.translitOn = elements.translitToggle.checked;
    
    // Update current transcript if translation is on
    if (state.translateOn && state.history.length > 0) {
        updateCurrentTranscript();
    }
    
    // Always update customer view if we're on customer tab
    if (state.currentTab === 'customer') {
        updateCustomerView();
    }
}

function toggleOfflineMode() {
    state.online = !elements.offlineToggle.checked;
    updateStatusChip();
}

// Utility functions
function showError(message) {
    console.error(message);
    showToast(`Error: ${message}`, 'error');
}

function showSuccess(message) {
    console.log(message);
    showToast(`Success: ${message}`, 'success');
}

// Toast notification system
function showToast(message, type = 'info') {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.toast');
    existingToasts.forEach(toast => toast.remove());
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    // Add styles
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#dc3545' : type === 'success' ? '#28a745' : '#007bff'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideInFromTop 0.3s ease-out;
        max-width: 300px;
        font-weight: 500;
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOutToTop 0.3s ease-in forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden && state.running) {
        // Pause demo when page is hidden
        pauseDemo();
    }
});

// Handle fullscreen changes
document.addEventListener('fullscreenchange', () => {
    const isFullscreen = !!document.fullscreenElement;
    elements.fullscreenButton.querySelector('span').textContent = isFullscreen ? 'Exit Fullscreen' : 'Fullscreen';
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (state.demoInterval) {
        clearInterval(state.demoInterval);
    }
});
