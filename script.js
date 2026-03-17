// ===== PRELOADER =====
window.addEventListener('load', () => {
  setTimeout(() => document.getElementById('preloader').classList.add('gone'), 900);
});

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('stuck', window.scrollY > 60);
}, { passive: true });

// ===== BURGER MENU =====
const burger = document.getElementById('burger');
const navMenu = document.getElementById('navMenu');
burger.addEventListener('click', () => {
  navMenu.classList.toggle('open');
  burger.setAttribute('aria-expanded', navMenu.classList.contains('open'));
});
navMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navMenu.classList.remove('open')));

// ===== PRODUCT SEARCH & FILTER =====
const searchQ = document.getElementById('searchQ');
const resultsCount = document.getElementById('resultsCount');

if (searchQ && resultsCount) {
  const searchClear = document.getElementById('searchClear');
  const catFilters = document.querySelectorAll('#catFilters .pill');
  const cards = document.querySelectorAll('.pcard');
  const noResults = document.getElementById('noResults');

  let activecat = 'all';

  function applyFilters() {
    const q = searchQ.value.toLowerCase().trim();
    searchClear.classList.toggle('show', q.length > 0);

    let visible = 0;
    cards.forEach(card => {
      const searchMatch = !q || card.dataset.search.includes(q) || card.querySelector('h3').textContent.toLowerCase().includes(q);
      const catMatch = activecat === 'all' || card.dataset.cat === activecat;
      const show = searchMatch && catMatch;
      card.classList.toggle('hide', !show);
      if (show) visible++;
    });

    noResults.style.display = visible === 0 ? 'block' : 'none';
    resultsCount.textContent = visible === cards.length
      ? `Showing all ${cards.length} products`
      : `Showing ${visible} product${visible !== 1 ? 's' : ''}`;
  }

  searchQ.addEventListener('input', applyFilters);
  searchClear.addEventListener('click', () => { searchQ.value = ''; applyFilters(); searchQ.focus(); });

  catFilters.forEach(btn => {
    btn.addEventListener('click', () => {
      catFilters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activecat = btn.dataset.cat;
      applyFilters();
    });
  });

  // Init count
  resultsCount.textContent = `Showing all ${cards.length} products`;
}

// ===== CONTACT FORM =====
const cForm = document.getElementById('cForm');
if (cForm) {
  cForm.addEventListener('submit', e => {
    e.preventDefault();
    cForm.style.display = 'none';
    document.getElementById('cfSuccess').style.display = 'block';
  });
}

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('in'), i * 60);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll('.pcard, .exp-card, .tcard, .vinfo-item, .contact-cta-card, .brand-block, .assurance-item').forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

// ===== AI CHAT =====
(function() {
  const messagesEl = document.getElementById('chatMessages');
  const inputEl    = document.getElementById('chatInput');
  const sendBtn    = document.getElementById('chatSend');
  const suggsEl    = document.getElementById('chatSuggestions');

  if (!messagesEl || !inputEl || !sendBtn) return;

  const history    = [];

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function appendMsg(text, role) {
    const div = document.createElement('div');
    div.className = `cmsg cmsg-${role === 'user' ? 'user' : 'bot'}`;
    div.innerHTML = `<div class="cmsg-bubble">${text}</div>`;
    messagesEl.appendChild(div);
    scrollToBottom();
    return div;
  }

  function setLoading(on) {
    sendBtn.disabled = on;
    inputEl.disabled = on;
  }

  async function sendMessage(text) {
    text = text.trim();
    if (!text) return;
    suggsEl.style.display = 'none';
    inputEl.value = '';
    appendMsg(text, 'user');
    history.push({ role: 'user', content: text });
    const typingEl = appendMsg('Aria is typing…', 'bot');
    typingEl.classList.add('cmsg-typing');
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history })
      });
      const data = await res.json();
      typingEl.remove();
      const reply = data.reply || 'Sorry, I could not get a response. Please call us at +91 8930200501.';
      appendMsg(reply, 'bot');
      history.push({ role: 'assistant', content: reply });
    } catch {
      typingEl.remove();
      appendMsg('Unable to connect right now. Please <a href="tel:8930200501" style="color:var(--gold)">call us</a> or <a href="https://wa.me/8930200501" style="color:var(--gold)">WhatsApp us</a>.', 'bot');
    }
    setLoading(false);
  }

  sendBtn.addEventListener('click', () => sendMessage(inputEl.value));
  inputEl.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(inputEl.value); });
  document.querySelectorAll('.chat-sugg').forEach(btn => {
    btn.addEventListener('click', () => sendMessage(btn.dataset.q));
  });
})();
