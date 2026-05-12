function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
    }
}

function toggleContent(button) {
    const hiddenContent = button.nextElementSibling;
    
    if (hiddenContent.classList.contains('show')) {
        hiddenContent.classList.remove('show');
        button.textContent = 'Learn More';
    } else {
        hiddenContent.classList.add('show');
        button.textContent = 'Show Less';
    }
}

window.addEventListener('load', function() {
    console.log('Website loaded successfully!');
});

// Indicate script loaded (helpful when opening via file://)
try {
    const status = document.getElementById('jsStatus');
    if (status) {
        status.textContent = 'JS: ready';
        status.style.display = 'block';
        setTimeout(() => { status.style.display = 'none'; }, 3000);
    }
} catch (e) {}

// Scroll-triggered sequential popups (enhanced)
(() => {
    const container = document.createElement('div');
    container.id = 'scrollPopupContainer';
    container.className = 'scroll-popup-container';
    document.body.appendChild(container);

    const sections = document.querySelectorAll('section');
    const queue = [];
    let showing = false;

    function createPopup(title, text, targetSection) {
        const el = document.createElement('div');
        el.className = 'scroll-popup';
        el.innerHTML = `
            <div class="icon">🔎</div>
            <div class="content">
                <div class="title">${title}</div>
                <div class="snippet">${text}</div>
                <div class="actions">
                    <button class="cta">Explore</button>
                    <button class="close" aria-label="Close">×</button>
                </div>
            </div>`;
        const closeBtn = el.querySelector('.close');
        const cta = el.querySelector('.cta');
        closeBtn.addEventListener('click', () => { hidePopup(el, targetSection); });
        cta.addEventListener('click', () => {
            // scroll to the section and close popup
            if (targetSection && typeof targetSection.scrollIntoView === 'function') {
                targetSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            hidePopup(el, targetSection);
        });
        return el;
    }

    function showNext() {
        if (showing) return;
        const item = queue.shift();
        if (!item) return;
        showing = true;
        const el = createPopup(item.title, item.text, item.section);
        container.appendChild(el);
        requestAnimationFrame(()=> el.classList.add('show'));
        // auto-hide after 5s
        const timeout = setTimeout(() => { hidePopup(el); }, 5000);
        function hidePopup(node, section) {
            clearTimeout(timeout);
            node.classList.remove('show');
            if (section) section.classList.remove('section-highlight');
            setTimeout(()=>{ if (node.parentNode) node.parentNode.removeChild(node); showing = false; showNext(); }, 300);
        }
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(ent => {
            if (ent.isIntersecting && ent.intersectionRatio > 0.4) {
                const el = ent.target;
                // enqueue a small message per section
                const title = el.querySelector('h2') ? el.querySelector('h2').textContent : 'Section';
                const text = el.querySelector('p') ? el.querySelector('p').textContent.replace(/\s+/g,' ').slice(0,120) : '';
                queue.push({ title, text, section: el });
                showNext();
                observer.unobserve(el);
            }
        });
    }, { threshold: [0.4] });

    sections.forEach(s => observer.observe(s));
})();

// Presentation mode: guided tour with auto-scroll
(() => {
    const steps = [
        { id: 'problem', title: 'The Problem', caption: 'Why collaboration between academia and industry is often challenging.' },
        { id: 'stats', title: 'Key Statistics', caption: 'Quick stats showing the collaboration gap and impact.' },
        { id: 'solutions', title: 'Solutions', caption: 'Suggested practical interventions to improve collaboration.' },
        { id: 'contact', title: 'Get Involved', caption: 'Reach out or register to participate in projects.' }
    ];
    let current = 0;
    let timer = null;
    const overlay = document.createElement('div');
    overlay.className = 'presentation-overlay';
    overlay.id = 'presentationOverlay';
    overlay.innerHTML = `<div class="presentation-card"><div class="presentation-caption" id="presentationCaption"></div><div class="presentation-controls"><button class="btn" id="prevStep">Prev</button><button class="btn" id="pauseResume">Pause</button><button class="btn" id="nextStep">Next</button><button class="btn" id="stopPresentation">Stop</button></div></div>`;
    document.body.appendChild(overlay);

    function highlightSection(id) {
        document.querySelectorAll('.section-highlight').forEach(s => s.classList.remove('section-highlight'));
        const el = document.getElementById(id);
        if (el) el.classList.add('section-highlight');
    }

    function showStep(i) {
        const step = steps[i];
        if (!step) return;
        const el = document.getElementById(step.id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        document.getElementById('presentationCaption').textContent = step.caption;
        highlightSection(step.id);
    }

    function start() {
        current = 0;
        overlay.classList.add('show');
        showStep(current);
        timer = setInterval(() => { current++; if (current >= steps.length) stop(); else showStep(current); }, 5000);
    }

    function stop() {
        overlay.classList.remove('show');
        clearInterval(timer);
        timer = null;
        document.querySelectorAll('.section-highlight').forEach(s => s.classList.remove('section-highlight'));
    }

    document.addEventListener('click', (e) => {
        if (e.target && e.target.id === 'stopPresentation') stop();
        if (e.target && e.target.id === 'nextStep') { current = Math.min(current+1, steps.length-1); showStep(current); }
        if (e.target && e.target.id === 'prevStep') { current = Math.max(current-1, 0); showStep(current); }
        if (e.target && e.target.id === 'pauseResume') {
            if (timer) { clearInterval(timer); timer = null; e.target.textContent = 'Resume'; }
            else { timer = setInterval(() => { current++; if (current >= steps.length) stop(); else showStep(current); }, 5000); e.target.textContent = 'Pause'; }
        }
    });

    window.startPresentation = start;
    window.stopPresentation = stop;
})();

window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
    } else {
        header.style.boxShadow = 'var(--shadow)';
    }
});
// ========================================
// Core interactive functions (vanilla JS)
// ========================================

// ANIMATE NUMBERS (if used elsewhere)
function animateNumbers() {
    const numbers = document.querySelectorAll('.stat-number');
    numbers.forEach(number => {
        const target = parseInt(number.getAttribute('data-target')) || parseInt(number.textContent) || 0;
        let current = 0;
        const increment = Math.max(1, Math.floor(target / 50));
        const interval = setInterval(() => {
            current += increment;
            if (current < target) {
                number.textContent = Math.floor(current);
            } else {
                clearInterval(interval);
                number.textContent = target;
            }
        }, 20);
    });
}

// POLL / INTERACTIVE ANSWER
function updateAnswer(button, answer) {
    const questionBox = button.closest('.question-box');
    const buttons = questionBox.querySelectorAll('.poll-button');
    buttons.forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');
    const answerDisplay = questionBox.querySelector('.answer-display');
    if (answerDisplay) {
        answerDisplay.textContent = '✓ You selected: ' + answer;
        answerDisplay.style.animation = 'none';
        setTimeout(() => { answerDisplay.style.animation = 'fadeIn 0.4s ease'; }, 10);
    }
}

// NEWSLETTER SUBSCRIPTION (client-side demo)
function subscribeNewsletter() {
    const emailInput = document.getElementById('emailInput');
    const email = emailInput ? emailInput.value.trim() : '';
    const messageDisplay = document.getElementById('subscribeMessage');
    if (!email) {
        if (messageDisplay) { messageDisplay.textContent = '❌ Please enter your email address'; messageDisplay.style.color = '#ef4444'; }
        return;
    }
    if (!email.includes('@')) {
        if (messageDisplay) { messageDisplay.textContent = '❌ Please enter a valid email address'; messageDisplay.style.color = '#ef4444'; }
        return;
    }
    if (messageDisplay) { messageDisplay.textContent = '✓ Thank you! Check your email for updates.'; messageDisplay.style.color = '#d4fc79'; }
    if (emailInput) emailInput.value = '';
}

// SCROLL-TO and toggles used by the page
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) element.scrollIntoView({ behavior: 'smooth' });
}

function toggleContent(button) {
    const hiddenContent = button.nextElementSibling;
    if (!hiddenContent) return;
    if (hiddenContent.classList.contains('show')) {
        hiddenContent.classList.remove('show');
        button.textContent = 'Learn More';
    } else {
        hiddenContent.classList.add('show');
        button.textContent = 'Show Less';
    }
}

function openEventLink() {
    // Navigate to local register/sign-in page
    window.location.href = 'register.html';
}
// backward-compat alias
window.openHackathonLink = openEventLink;

// ========================================
// Lightweight local "generative AI" helpers
// These are deterministic templates that run fully in-browser
// No external API calls, so safe for event demos/offline use
// ========================================

function setAiOutput(html) {
    const out = document.getElementById('aiOutputContent');
    if (!out) return;
    // If html is plain text, try to convert simple lists into structured HTML
    if (typeof html === 'string') {
        // Detect bullet lists (lines starting with - or *)
        const lines = html.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        const isList = lines.every(l => /^(-|\*|\d+\.)\s+/.test(l) || l.length < 200);
        if (isList && lines.length > 1) {
            // render as list inside a card
            const listItems = lines.map(l => l.replace(/^(-|\*|\d+\.)\s+/, ''));
            out.innerHTML = '<div class="ai-card"><ul class="ai-list">' + listItems.map(i => '<li>' + escapeHtml(i) + '</li>').join('') + '</ul></div>';
            return;
        }
    }
    out.innerHTML = html;
}

function showToast(msg, timeout = 3000) {
    const t = document.getElementById('aiToast');
    if (!t) return;
    t.textContent = msg;
    t.style.display = 'block';
    requestAnimationFrame(() => { t.style.opacity = '1'; t.style.transform = 'translateY(0)'; });
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateY(-6px)'; setTimeout(()=> t.style.display = 'none', 300); }, timeout);
}

function setLoading(loading) {
    const spinner = document.getElementById('aiSpinner');
    const buttons = document.querySelectorAll('.ai-buttons button, .ai-buttons + button, .ai-buttons + .cta-button');
    if (spinner) spinner.style.display = loading ? 'inline-block' : 'none';
    const all = document.querySelectorAll('#aiModal .cta-button');
    all.forEach(b => b.disabled = !!loading);
    const loadingEl = document.getElementById('aiLoading');
    if (loadingEl) loadingEl.style.display = loading ? 'block' : 'none';
}

// Modal show/hide with focus trap
function openAiModal() {
    const modal = document.getElementById('aiModal');
    if (!modal) return;
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    const content = modal.querySelector('.modal-content');
    if (content) content.focus();
    // setup focus trap
    trapFocus(modal);
}

function closeAiModal() {
    const modal = document.getElementById('aiModal');
    if (!modal) return;
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    releaseFocusTrap();
}

let _focusTrap = null;
function trapFocus(modal) {
    const focusable = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
    const nodes = Array.from(modal.querySelectorAll(focusable));
    if (nodes.length === 0) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    function handler(e) {
        if (e.key !== 'Tab') return;
        if (e.shiftKey) {
            if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
            if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
    }
    document.addEventListener('keydown', handler);
    _focusTrap = handler;
}

function releaseFocusTrap() {
    if (_focusTrap) { document.removeEventListener('keydown', _focusTrap); _focusTrap = null; }
}

function insertSample() {
    const ta = document.getElementById('aiInput');
    if (!ta) return;
    ta.value = 'Students and industry teams struggle with mismatched timelines and unclear IP; propose short pilot internships and shared microgrants.';
    showToast('Sample text inserted');
}

function generateSummary() {
    const input = (document.getElementById('aiInput') || {}).value || '';
    if (!input.trim()) {
        setAiOutput('<em>Enter a paragraph or paste content to summarize. Example: "Universities and companies struggle because of misaligned incentives and timelines."</em>');
        return;
    }
    // If optional remote LLM is configured, prefer it for richer output
    // Prefer proxy if available, otherwise use client-side key/meta
    const proxyMeta = document.querySelector('meta[name="ai-proxy"]');
    // Only use a proxy if explicitly configured via window.AI_PROXY_URL or a meta tag
    const proxyUrl = window.AI_PROXY_URL || (proxyMeta && proxyMeta.content) || null;
    if (proxyUrl || window.OPENAI_API_KEY || document.querySelector('meta[name="openai-key"]')) {
        setLoading(true);
        runAiRemote('summarize', input).finally(() => setLoading(false));
        return;
    }
    // Simple heuristic: take first 2 sentences or first 200 chars
    const sentences = input.match(/[^.!?]+[.!?]?/g) || [];
    let summary = '';
    if (sentences.length >= 2) {
        summary = sentences.slice(0,2).join(' ').trim();
    } else if (input.length > 220) {
        summary = input.slice(0,220).trim() + '...';
    } else {
        summary = input.trim();
    }
    // Add one actionable insight based on keywords
    const insight = inferInsight(input);
    setAiOutput('<strong>Summary</strong><p>' + escapeHtml(summary) + '</p><strong>Actionable idea</strong><p>' + escapeHtml(insight) + '</p>');
}

function generateEmail() {
    const input = (document.getElementById('aiInput') || {}).value || '';
    const context = input.trim() || 'brief intro about a potential collaboration opportunity between your team and the recipient.';
    const email = `Subject: Partnership opportunity — Academia & Industry Collaboration\n\nHello [Name],\n\nMy name is [Your Name], and I am working on a project focused on improving collaboration between academia and industry. I wanted to reach out because ${context}\n\nWe believe there is an opportunity to work together on a pilot project that: (1) addresses a real industry problem, (2) involves students and researchers, and (3) produces results within a semester.\n\nWould you be available for a short call to discuss potential collaboration?\n\nBest regards,\n[Your Name]\n[Your Contact Information]`;
    // If remote configured, prefer it
    const proxyMeta = document.querySelector('meta[name="ai-proxy"]');
    const proxyUrl = window.AI_PROXY_URL || (proxyMeta && proxyMeta.content) || null;
    if (proxyUrl || window.OPENAI_API_KEY || document.querySelector('meta[name="openai-key"]')) {
        // remote will return a formatted email; send context
        runAiRemote('email', input || '');
        return;
    }
    setAiOutput('<strong>Draft Outreach Email</strong><pre>' + escapeHtml(email) + '</pre>');
}

function generateIdeas() {
    const input = (document.getElementById('aiInput') || {}).value || '';
    const proxyMeta = document.querySelector('meta[name="ai-proxy"]');
    const proxyUrl = window.AI_PROXY_URL || (proxyMeta && proxyMeta.content) || null;
    if (proxyUrl || window.OPENAI_API_KEY || document.querySelector('meta[name="openai-key"]')) {
        setLoading(true);
        runAiRemote('ideas', input).finally(() => setLoading(false));
        return;
    }
    const seed = input.trim().toLowerCase();
    const ideas = [];
    // Idea 1: student-focused
    ideas.push('Student-Industry Rapid Projects: 6–8 week sprints where student teams solve a real problem provided by a company; deliverables include a demo and deployment guide.');
    // Idea 2: shared lab/resource
    ideas.push('Shared Microgrants: small, matched funding for joint proof-of-concept projects, with IP and publication guidelines preset.');
    // Idea 3: liaison/program
    ideas.push('Liaison Fellowship: short-term rotation of industry professionals into university classrooms and researchers into companies to align expectations.');
    // Tailor minorly if certain keywords present
    if (seed.includes('fund') || seed.includes('money')) {
        ideas[1] = 'Shared Microgrants: matched funding and clear milestones to lower the barrier for initial collaborations.';
    }
    if (seed.includes('student') || seed.includes('intern')) {
        ideas[0] = 'Capstone-as-a-Service: companies provide real problems as capstone projects with mentor support and evaluation rubrics.';
    }
    const html = '<strong>Ideas</strong><ol>' + ideas.map(i => '<li>' + escapeHtml(i) + '</li>').join('') + '</ol>';
    setAiOutput(html);
}

function copyAiOutput() {
    const out = document.getElementById('aiOutput');
    if (!out) return;
    const text = out.innerText || out.textContent || '';
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            alert('Copied AI output to clipboard');
        });
    } else {
        // fallback
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); alert('Copied AI output to clipboard'); } catch (e) { alert('Copy failed'); }
        document.body.removeChild(ta);
    }
}

// Contact form handlers (demo: stores messages in localStorage)
function submitContactForm(e) {
    e.preventDefault();
    const name = (document.getElementById('contactName') || {}).value || '';
    const email = (document.getElementById('contactEmail') || {}).value || '';
    const message = (document.getElementById('contactMessage') || {}).value || '';
    const status = document.getElementById('contactMessageStatus');
    if (!name.trim() || !email.trim() || !message.trim()) {
        if (status) { status.textContent = 'Please complete all fields.'; }
        return;
    }
    try {
        const payload = { name: name.trim(), email: email.trim(), message: message.trim(), ts: new Date().toISOString() };
        const cur = JSON.parse(localStorage.getItem('contact_messages') || '[]');
        cur.push(payload);
        localStorage.setItem('contact_messages', JSON.stringify(cur));
        if (status) { status.textContent = 'Thanks — message saved locally. We will get back to you via email.'; }
        showToast('Message saved (demo)');
        // clear form after submit
        setTimeout(() => { clearContactForm(); }, 800);
    } catch (e) {
        if (status) { status.textContent = 'Failed to save message.'; }
    }
}

function clearContactForm() {
    const name = document.getElementById('contactName'); if (name) name.value = '';
    const email = document.getElementById('contactEmail'); if (email) email.value = '';
    const msg = document.getElementById('contactMessage'); if (msg) msg.value = '';
    const status = document.getElementById('contactMessageStatus'); if (status) status.textContent = '';
}

// Small helpers
function escapeHtml(s) {
    return s.replace(/[&<>\"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]; });
}

function inferInsight(text) {
    const t = text.toLowerCase();
    if (t.includes('timeline') || t.includes('slow') || t.includes('time')) return 'Create short, time-boxed pilots (6–12 weeks) to align academic research with industry timelines.';
    if (t.includes('fund') || t.includes('money')) return 'Offer matched microgrants and clear ROI metrics to make initial partnerships low-risk.';
    if (t.includes('ip') || t.includes('intellectual')) return 'Predefine IP rules in simple templates to reduce negotiation overhead.';
    return 'Start with a small pilot that has clear scope, deliverables, and a named coordinator from both sides.';
}

// Initialize some behaviors on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    // Start animations if present
    animateNumbers();
    // Basic scroll handler visual tweak
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (!header) return;
        if (window.scrollY > 50) header.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
        else header.style.boxShadow = '';
    });
    // Keyboard shortcuts: Esc to close modal, Ctrl/Cmd+K to open
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeAiModal();
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            openAiModal();
            const ta = document.getElementById('aiInput');
            if (ta) ta.focus();
        }
    });
    // Try server session first — but guard against file:// where relative fetches fail
    try {
        if (location.protocol !== 'file:') {
            fetch('/api/session').then(r => r.json()).then(data => {
                if (data && data.user) {
                    localStorage.setItem('demo_session', data.user);
                }
                renderUserStatus();
            }).catch(() => {
                // fallback to client-side
                renderUserStatus();
            });
        } else {
            // file:// — skip server session attempt
            renderUserStatus();
        }
    } catch (e) {
        renderUserStatus();
    }
    // Mobile nav toggle
    const mobileToggle = document.getElementById('mobileNavToggle');
    const mainNav = document.getElementById('mainNav');
    if (mobileToggle && mainNav) {
        mobileToggle.addEventListener('click', () => {
            const open = mobileToggle.getAttribute('aria-expanded') === 'true';
            mobileToggle.setAttribute('aria-expanded', String(!open));
            if (open) { mainNav.classList.remove('open'); } else { mainNav.classList.add('open'); }
        });
    }
});

function getSessionUser() {
    return localStorage.getItem('demo_session') || null;
}

function renderUserStatus() {
    const el = document.getElementById('userStatus');
    if (!el) return;
    const user = getSessionUser();
    if (user) {
        el.innerHTML = `Signed in: <strong>${escapeHtml(user)}</strong> <button style="margin-left:8px; padding:4px 8px; border-radius:6px;" onclick="reactSignOut()">Sign out</button>`;
    } else {
        el.innerHTML = `<a href="register.html" style="color:var(--white); text-decoration:underline">Register / Sign In</a>`;
    }
}

function reactSignOut() {
    localStorage.removeItem('demo_session');
    renderUserStatus();
    // Optionally reload to update UI
    setTimeout(()=>{ window.location.reload(); }, 300);
}

// Modal controls
// Ensure the public modal functions point to the focus-trap implementations above
window.openAiModal = openAiModal;
window.closeAiModal = closeAiModal;

// Optional remote call (OpenAI-compatible) — ONLY used if configured
async function runAiRemote(mode, input) {
    const metaProxy = document.querySelector('meta[name="ai-proxy"]');
    const proxyUrl = window.AI_PROXY_URL || (metaProxy && metaProxy.content) || '/api/ai';
    const metaKey = document.querySelector('meta[name="openai-key"]');
    const clientKey = window.OPENAI_API_KEY || (metaKey && metaKey.content);
    const loading = document.getElementById('aiLoading');
    if (loading) loading.style.display = 'block';
    try {
        // Build a chat completion payload
        const promptMap = {
            summarize: `Summarize the following text in 3 sentences and provide 1 actionable idea:\n\n${input}`,
            ideas: `Based on the following context, list 4 concise collaboration ideas for academia-industry projects:\n\n${input}`,
            email: `Draft a concise outreach email (subject + body) to propose a collaboration using this context:\n\n${input}`
        };
        const body = {
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: promptMap[mode] || input }],
            max_tokens: 400
        };

        // Prefer proxy if it's available (server-side key)
        if (proxyUrl) {
            // If the page was opened under file://, skip proxy calls to avoid network errors
            if (location.protocol === 'file:') {
                throw new Error('Running locally (file://) — skipping remote proxy call');
            }
            const res = await fetch(proxyUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            const text = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || JSON.stringify(data);
            setAiOutput('<pre>' + escapeHtml(text) + '</pre>');
            return;
        }

        // Fallback: direct client-side call (requires client key)
        if (!clientKey) throw new Error('No API key configured (client)');
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${clientKey}` },
            body: JSON.stringify(body)
        });
        const data = await res.json();
        const text = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || JSON.stringify(data);
        setAiOutput('<pre>' + escapeHtml(text) + '</pre>');
    } catch (e) {
        setAiOutput('<em>Remote AI call failed — falling back to local generator. Error: ' + escapeHtml(String(e)) + '</em>');
        // fallback to local
        if (mode === 'summarize') generateSummary();
        if (mode === 'ideas') generateIdeas();
        if (mode === 'email') generateEmail();
    } finally {
        if (loading) loading.style.display = 'none';
    }
}