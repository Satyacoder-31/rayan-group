// ============================================================================
// RAYAN GROUP — LIVE ASSISTANCE CHAT CONTROLLER
// Real-Time Visitor Live Assistance, Automated Reply System & Custom Live Chat
// ============================================================================

class LiveAssistanceChat {
  constructor() {
    this.checkInactivityReset();
    this.sessionId = this.getOrCreateSessionId();
    this.visitorName = localStorage.getItem('rayan_chat_visitor_name') || 'Guest Visitor';
    this.isMuted = localStorage.getItem('rayan_chat_muted') === 'true';
    this.isLiveHumanMode = localStorage.getItem(`rayan_chat_live_mode_${this.sessionId}`) === 'true';
    this.audioCtx = null;
    this.pollInterval = null;
    this.automatedReplyTimeout = null;
    this.messages = [];
    this.lastPolledTimestamp = 0;
    this.broadcastChannel = null;
    this.lockedBar = null;
    this.composerWrap = null;
    this.profileBar = null;
    this.newChatBtn = null;

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('rayan_live_desk_channel');
        this.broadcastChannel.onmessage = (event) => this.handleBroadcastMessage(event.data);
      } catch (e) {
        console.warn('BroadcastChannel not supported', e);
      }
    }
  }

  /**
   * Resets the chat session if the visitor has been inactive for > 1 hour
   */
  checkInactivityReset() {
    const ONE_HOUR_MS = 60 * 60 * 1000; // 1 hour = 3,600,000 ms
    const lastActiveStr = localStorage.getItem('rayan_chat_last_active_time');
    const now = Date.now();

    if (lastActiveStr) {
      const lastActive = parseInt(lastActiveStr, 10);
      if (!isNaN(lastActive) && lastActive > 0 && (now - lastActive) > ONE_HOUR_MS) {
        // More than 1 hour has elapsed since last visit! Clear previous session
        const oldId = localStorage.getItem('rayan_chat_session_id');
        if (oldId) {
          localStorage.removeItem(`rayan_chat_msgs_${oldId}`);
          localStorage.removeItem(`rayan_chat_live_mode_${oldId}`);
          try {
            sessionStorage.removeItem(`rayan_chat_email_notified_${oldId}`);
            sessionStorage.removeItem(`rayan_chat_human_email_notified_${oldId}`);
          } catch (e) {}
        }
        localStorage.removeItem('rayan_chat_session_id');
        this.isLiveHumanMode = false;
        this.touchActiveTimestamp();
        return true;
      }
    }
    this.touchActiveTimestamp();
    return false;
  }

  touchActiveTimestamp() {
    try {
      localStorage.setItem('rayan_chat_last_active_time', Date.now().toString());
    } catch (e) {}
  }

  getOrCreateSessionId() {
    let id = localStorage.getItem('rayan_chat_session_id');
    if (!id) {
      id = 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
      localStorage.setItem('rayan_chat_session_id', id);
    }
    return id;
  }

  /**
   * Resets the active chat session and starts fresh in Automated Advisory mode
   */
  resetSession(notifyUser = true) {
    const oldSessionId = this.sessionId;
    if (oldSessionId) {
      localStorage.removeItem(`rayan_chat_msgs_${oldSessionId}`);
      localStorage.removeItem(`rayan_chat_live_mode_${oldSessionId}`);
      try {
        sessionStorage.removeItem(`rayan_chat_email_notified_${oldSessionId}`);
        sessionStorage.removeItem(`rayan_chat_human_email_notified_${oldSessionId}`);
      } catch (e) {}
    }

    // Generate fresh session ID
    this.sessionId = 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
    localStorage.setItem('rayan_chat_session_id', this.sessionId);
    localStorage.removeItem(`rayan_chat_live_mode_${this.sessionId}`);

    this.messages = [];
    this.isLiveHumanMode = false;
    this.touchActiveTimestamp();

    // Clear messages from DOM (keep welcome-msg-initial if present)
    if (this.messagesContainer) {
      const items = this.messagesContainer.querySelectorAll('.chat-msg-row:not(#welcome-msg-initial)');
      items.forEach(el => el.remove());
    }

    // Reset UI to Automated Advisory mode
    this.setAutomatedModeUi();
    this.scrollToBottom();

    if (notifyUser) {
      this.playChime();
      const resetNotice = {
        id: 'new_chat_' + Date.now(),
        sessionId: this.sessionId,
        sender: 'admin',
        senderName: '🤖 Rayan Automated Advisory',
        text: 'New chat session started. Our engineering and project advisory desk is online. Please choose from the topics below or connect with our Live Desk anytime.',
        actions: [
          { label: '📋 Request Tender Proposal / RFP', action: 'send_prompt', payload: 'I would like to request an EPC Tender / RFP proposal.' },
          { label: '🏢 Civil Construction & Fit-Out', action: 'send_prompt', payload: 'Inquiry regarding Civil Construction & High-Rise contracting.' },
          { label: '💬 Connect to Live Assistance Chat', action: 'live_human', isLive: true }
        ],
        timestamp: Date.now(),
        isAutomated: true,
        hideSatisfaction: true
      };
      this.messages.push(resetNotice);
      this.saveCachedMessages();
      this.appendMessageToDom(resetNotice);
      this.scrollToBottom();
    }
  }

  init() {
    this.checkInactivityReset();
    this.bindDomElements();
    this.bindEvents();
    this.loadCachedMessages();
    this.startPolling();

    if (this.isLiveHumanMode) {
      this.activateLiveHumanMode(false);
    } else {
      this.setAutomatedModeUi();
    }
  }

  bindDomElements() {
    this.widget = document.getElementById('assistance-widget');
    this.card = document.getElementById('assistance-card');
    this.triggerBtn = document.getElementById('assistance-trigger-btn');
    this.closeBtn = document.getElementById('assistance-close-btn');

    // View containers
    this.menuView = document.getElementById('assistance-menu-view');
    this.chatView = document.getElementById('assistance-chat-view');

    // Controls
    this.startChatBtn = document.getElementById('opt-start-live-chat');
    this.backToMenuBtn = document.getElementById('chat-back-to-menu-btn');
    this.soundToggleBtn = document.getElementById('chat-sound-toggle-btn');
    this.unreadBadge = document.getElementById('assistance-unread-badge');
    this.newChatBtn = document.getElementById('chat-new-chat-btn');

    // Chat elements
    this.messagesContainer = document.getElementById('chat-messages-container');
    this.composerWrap = document.querySelector('.chat-composer-wrap');
    this.composerForm = document.getElementById('chat-composer-form');
    this.inputField = document.getElementById('chat-input-field');
    this.sendBtn = document.getElementById('chat-send-btn');
    this.profileBar = document.querySelector('.chat-visitor-profile-bar');
    this.visitorNameInput = document.getElementById('chat-visitor-name-input');
    this.typingIndicator = document.getElementById('chat-typing-indicator');

    // Status elements
    this.suggestionsWrap = document.querySelector('.chat-suggestions-wrap');
    this.statusText = document.querySelector('.chat-agent-status-text');
    this.pulseDot = document.querySelector('.chat-agent-pulse');

    // Ensure locked bar exists for automated mode
    this.ensureLockedComposerBar();

    if (this.visitorNameInput) {
      this.visitorNameInput.value = this.visitorName === 'Guest Visitor' ? '' : this.visitorName;
    }

    // Isolate scrolling from Lenis smooth-scroll on main page
    [this.widget, this.card, this.chatView, this.messagesContainer, this.menuView].forEach(el => {
      if (el) el.setAttribute('data-lenis-prevent', 'true');
    });

    if (this.card) {
      this.card.addEventListener('wheel', (e) => {
        e.stopPropagation();
        if (this.messagesContainer && !this.messagesContainer.contains(e.target)) {
          this.messagesContainer.scrollTop += e.deltaY;
        }
      }, { passive: true });

      this.card.addEventListener('touchmove', (e) => {
        e.stopPropagation();
      }, { passive: true });
    }

    if (this.messagesContainer) {
      this.messagesContainer.addEventListener('wheel', (e) => {
        e.stopPropagation();
      }, { passive: true });
      this.messagesContainer.addEventListener('touchmove', (e) => {
        e.stopPropagation();
      }, { passive: true });
    }
  }

  ensureLockedComposerBar() {
    this.lockedBar = document.getElementById('chat-composer-locked-bar');
    if (!this.lockedBar && this.chatView) {
      this.lockedBar = document.createElement('div');
      this.lockedBar.id = 'chat-composer-locked-bar';
      this.lockedBar.className = 'chat-composer-locked-bar';
      this.lockedBar.innerHTML = `
        <div class="chat-locked-status">
          <span class="chat-locked-badge">🤖 Automated Corporate Advisory</span>
          <span class="chat-locked-hint">Select a question or connect with our team</span>
        </div>
        <button type="button" class="btn-unlock-live-chat" id="btn-unlock-live-chat" aria-label="Connect to Live Assistance Chat">
          <span class="live-pulse-green"></span>
          <span>💬 Connect to Live Assistance Chat</span>
        </button>
      `;

      if (this.composerWrap && this.composerWrap.parentNode) {
        this.composerWrap.parentNode.insertBefore(this.lockedBar, this.composerWrap);
      } else {
        this.chatView.appendChild(this.lockedBar);
      }
    }

    if (this.lockedBar) {
      const unlockBtn = this.lockedBar.querySelector('#btn-unlock-live-chat');
      if (unlockBtn && !unlockBtn.dataset.bound) {
        unlockBtn.dataset.bound = 'true';
        unlockBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.activateLiveHumanMode(true);
        });
      }
    }
  }

  bindEvents() {
    if (this.newChatBtn) {
      this.newChatBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.touchActiveTimestamp();
        if (this.messages && this.messages.length > 0) {
          if (confirm('Start a new chat conversation? This will clear your current conversation and start fresh.')) {
            this.resetSession(true);
          }
        } else {
          this.resetSession(true);
        }
      });
    }

    if (this.startChatBtn) {
      this.startChatBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchToChatView();
      });
    }

    if (this.backToMenuBtn) {
      this.backToMenuBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchToMenuView();
      });
    }

    if (this.soundToggleBtn) {
      this.soundToggleBtn.addEventListener('click', () => {
        this.isMuted = !this.isMuted;
        localStorage.setItem('rayan_chat_muted', this.isMuted);
        this.updateSoundBtn();
      });
    }

    if (this.visitorNameInput) {
      this.visitorNameInput.addEventListener('change', () => {
        const val = this.visitorNameInput.value.trim();
        this.visitorName = val || 'Guest Visitor';
        localStorage.setItem('rayan_chat_visitor_name', this.visitorName);
      });
    }

    if (this.composerForm) {
      this.composerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.sendVisitorMessage();
      });
    }

    // Direct Topic Chips listener
    document.querySelectorAll('.assistance-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        const text = chip.textContent.trim();
        this.switchToChatView();
        this.askAutomatedQuestion(`Inquiry regarding: ${text}`);
      });
    });

    // Quick suggestions inside chat
    document.querySelectorAll('.chat-suggestion-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        const action = chip.getAttribute('data-action');
        if (action === 'live_human') {
          this.activateLiveHumanMode(true);
          return;
        }
        const text = chip.getAttribute('data-prompt') || chip.textContent.trim();
        this.askAutomatedQuestion(text);
      });
    });
  }

  renderAutomatedQuestionChips() {
    if (!this.suggestionsWrap) return;
    this.suggestionsWrap.innerHTML = '';

    const questions = [
      { title: '📋 Request Tender Proposal / RFP', prompt: 'I would like to request an EPC Tender / RFP proposal.' },
      { title: '🏢 Civil Construction & High-Rise EPC', prompt: 'Inquiry regarding Civil Construction & High-Rise contracting.' },
      { title: '⚡ Energy & Process Pipelines', prompt: 'Inquiry regarding Energy Facilities & Process Pipelines.' },
      { title: '💳 Vendor Accounts & Invoices', prompt: 'Inquiry regarding vendor invoices, payment status, and accounts.' },
      { title: '📦 Procurement & Supplier Onboarding', prompt: 'Inquiry regarding vendor registration and approved supplier onboarding.' },
      { title: '📍 Dual Corporate HQs & Direct Lines', prompt: 'Where are your corporate offices located and how can I contact you?' },
      { title: '🏛️ Executive Leadership & Directors', prompt: 'I would like to connect with the Executive Directors.' }
    ];

    questions.forEach(q => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'chat-suggestion-chip';
      chip.setAttribute('data-prompt', q.prompt);
      chip.textContent = q.title;
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        this.askAutomatedQuestion(q.prompt);
      });
      this.suggestionsWrap.appendChild(chip);
    });

    const liveBtn = document.createElement('button');
    liveBtn.type = 'button';
    liveBtn.className = 'chat-suggestion-chip';
    liveBtn.setAttribute('data-action', 'live_human');
    liveBtn.style.cssText = 'border-color: rgba(16, 185, 129, 0.45); background: rgba(16, 185, 129, 0.12); color: #34d399; font-weight: 700;';
    liveBtn.innerHTML = '<span>💬 Connect to Live Assistance Chat</span>';
    liveBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.activateLiveHumanMode(true);
    });
    this.suggestionsWrap.appendChild(liveBtn);
  }

  setAutomatedModeUi() {
    this.isLiveHumanMode = false;
    if (this.lockedBar) this.lockedBar.style.display = 'flex';
    if (this.composerWrap) this.composerWrap.style.display = 'none';
    if (this.profileBar) this.profileBar.style.display = 'none';

    const banner = document.getElementById('chat-live-mode-banner');
    if (banner) banner.style.display = 'none';

    if (this.statusText) {
      this.statusText.innerHTML = '<span style="color:#38bdf8;">●</span> Automated Advisory • Instant Answers';
    }
    if (this.pulseDot) {
      this.pulseDot.style.background = '#38bdf8';
      this.pulseDot.style.boxShadow = '0 0 8px #38bdf8';
    }

    if (this.suggestionsWrap) {
      this.suggestionsWrap.style.display = 'flex';
      this.renderAutomatedQuestionChips();
    }
  }

  async askAutomatedQuestion(text) {
    this.touchActiveTimestamp();
    const msg = {
      id: 'q_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      sessionId: this.sessionId,
      sender: 'visitor',
      senderName: this.visitorName,
      text: text,
      timestamp: Date.now(),
      page: window.location.pathname
    };

    if (!this.isMessageInList(msg, this.messages)) {
      this.messages.push(msg);
      this.saveCachedMessages();
      this.appendMessageToDom(msg);
      this.scrollToBottom();
    }

    this.triggerAutomatedReply(text);
  }

  switchToChatView(trigger = 'opened_chat', extraMsg = '') {
    this.touchActiveTimestamp();
    if (this.menuView) this.menuView.classList.add('view-hidden');
    if (this.chatView) this.chatView.classList.remove('view-hidden');
    this.clearUnreadBadge();

    if (this.isLiveHumanMode) {
      this.activateLiveHumanMode(false);
      if (this.inputField) this.inputField.focus();
      this.notifyChatOpened('live_human', extraMsg);
    } else {
      this.setAutomatedModeUi();
    }

    this.scrollToBottom();
  }

  async notifyChatOpened(triggerType = 'opened_chat', extraMsg = '') {
    const notifKey = `rayan_chat_email_notified_${this.sessionId}`;
    const humanNotifKey = `rayan_chat_human_email_notified_${this.sessionId}`;

    if (triggerType === 'live_human') {
      if (sessionStorage.getItem(humanNotifKey)) return;
      sessionStorage.setItem(humanNotifKey, 'true');
    } else {
      if (sessionStorage.getItem(notifKey)) return;
      sessionStorage.setItem(notifKey, 'true');
    }

    const visitorName = this.visitorName || 'Website Visitor';
    const currentUrl = window.location.href;

    // 1. Dispatch to Hostinger PHP backend (/api/chat)
    try {
      const endpoint = (window.location.pathname.startsWith('/site') ? '/site' : '') + '/api/chat';
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'notify_chat_open',
          sessionId: this.sessionId,
          visitorName: visitorName,
          page: currentUrl,
          trigger: triggerType,
          message: extraMsg || '',
          timestamp: Date.now()
        })
      }).catch(() => {});
    } catch (e) {}

    // 2. Dispatch via FormSubmit directly to rayan@rayan-group.com
    try {
      const isUrgent = (triggerType === 'live_human');
      const payload = {
        _subject: isUrgent
          ? `🚨 [URGENT Live Chat] Client Requested Live Human Agent on rayan-group.com`
          : `🔔 [Live Chat Alert] Client opened live assistance desk on rayan-group.com`,
        _cc: 'tender@rayan-group.com',
        "Notification Type": isUrgent ? "Human Agent Requested" : "Live Chat Opened",
        "Visitor / Client": visitorName,
        "Session ID": this.sessionId,
        "Active Page URL": currentUrl,
        "Time (GST)": new Date().toLocaleString('en-US', { timeZone: 'Asia/Dubai' }),
        "Client Message / Note": extraMsg || "Client has opened the live chat desk and is currently waiting for assistance.",
        "Direct Admin Desk Link": "https://rayan-group.com/admin/",
        _template: "table"
      };

      fetch('https://formsubmit.co/ajax/rayan@rayan-group.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      }).catch(() => {});
    } catch (e) {}
  }

  switchToMenuView() {
    if (this.chatView) this.chatView.classList.add('view-hidden');
    if (this.menuView) this.menuView.classList.remove('view-hidden');
  }

  updateSoundBtn() {
    if (!this.soundToggleBtn) return;
    this.soundToggleBtn.innerHTML = this.isMuted ? '🔇' : '🔔';
    this.soundToggleBtn.classList.toggle('is-muted', this.isMuted);
  }

  playChime() {
    if (this.isMuted) return;
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, this.audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.35);
    } catch (e) {}
  }

  isMessageInList(msg, list) {
    if (!msg || !Array.isArray(list)) return false;
    return list.some(m => {
      if (m.id && msg.id && m.id === msg.id) return true;
      if (m.sender === msg.sender && (m.text || '').trim() === (msg.text || '').trim()) {
        const t1 = m.timestamp || 0;
        const t2 = msg.timestamp || 0;
        if (Math.abs(t1 - t2) < 6000) return true;
      }
      return false;
    });
  }

  loadCachedMessages() {
    try {
      const saved = localStorage.getItem(`rayan_chat_msgs_${this.sessionId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.messages = [];
        if (Array.isArray(parsed)) {
          parsed.forEach(m => {
            if (!this.isMessageInList(m, this.messages)) {
              this.messages.push(m);
            }
          });
        }
        this.renderAllMessages();
      }
    } catch (e) {}
  }

  saveCachedMessages() {
    try {
      localStorage.setItem(`rayan_chat_msgs_${this.sessionId}`, JSON.stringify(this.messages));
    } catch (e) {}
  }

  renderAllMessages() {
    if (!this.messagesContainer) return;
    const items = this.messagesContainer.querySelectorAll('.chat-msg-row:not(#welcome-msg-initial)');
    items.forEach(el => el.remove());

    this.messages.forEach(msg => this.appendMessageToDom(msg));
    this.scrollToBottom();
  }

  formatDeskMessage(str) {
    if (!str) return '';
    let formatted = this.escapeHtml(str);
    // Convert bold **text**
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Convert bullet points •
    formatted = formatted.replace(/^• (.*?)$/gm, '<div style="padding-left:0.5rem;margin:0.2rem 0;">• $1</div>');
    // Convert emails into clickable mailto
    formatted = formatted.replace(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi, '<a href="mailto:$1" style="color:#38bdf8;text-decoration:underline;">$1</a>');
    // Convert phone numbers
    formatted = formatted.replace(/(\+\d{1,3}-\d{6,10})/g, '<a href="tel:$1" style="color:#34d399;text-decoration:none;font-weight:600;">$1</a>');
    // Convert newlines to br
    formatted = formatted.replace(/\n/g, '<br>');
    return formatted;
  }

  appendMessageToDom(msg) {
    if (!this.messagesContainer) return;
    if (msg.id && document.getElementById(msg.id)) return;

    // Check if duplicate already exists in DOM
    const domHasMsg = Array.from(this.messagesContainer.querySelectorAll('.chat-msg-row')).some(el => {
      if (el.id && msg.id && el.id === msg.id) return true;
      const bubble = el.querySelector('.chat-msg-bubble');
      const isSenderMatch = (msg.sender === 'admin' ? el.classList.contains('msg-desk') : el.classList.contains('msg-visitor'));
      if (isSenderMatch && bubble) {
        const clone = bubble.cloneNode(true);
        const timeEl = clone.querySelector('.chat-msg-time');
        if (timeEl) timeEl.remove();
        const actionsEl = clone.querySelector('.chat-inline-actions');
        if (actionsEl) actionsEl.remove();
        if (clone.textContent.trim() === (msg.text || '').trim()) return true;
      }
      return false;
    });
    if (domHasMsg) return;

    const row = document.createElement('div');
    row.className = `chat-msg-row ${msg.sender === 'admin' ? 'msg-desk' : 'msg-visitor'}`;
    row.id = msg.id;

    const timeStr = new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const senderDisplay = msg.sender === 'admin' 
      ? (msg.isAutomated ? '🤖 Rayan Automated Advisory' : '🏛️ Rayan Executive Desk') 
      : (msg.senderName || 'You');

    let bodyHtml = '';
    if (msg.sender === 'admin') {
      bodyHtml = this.formatDeskMessage(msg.text);
      if (msg.actions && msg.actions.length > 0) {
        bodyHtml += `<div class="chat-inline-actions">`;
        msg.actions.forEach(act => {
          if (act.url) {
            bodyHtml += `<a href="${act.url}" class="chat-action-btn" target="${act.url.startsWith('http') || act.url.startsWith('mailto') || act.url.startsWith('tel') ? '_blank' : '_self'}">${act.label}</a>`;
          } else {
            bodyHtml += `<button type="button" class="chat-action-btn ${act.isLive ? 'btn-live-human' : ''}" data-action="${act.action || ''}" data-payload="${this.escapeHtml(act.payload || '')}">${act.label}</button>`;
          }
        });
        bodyHtml += `</div>`;
      }

      // If automated response and satisfaction check is not hidden, append satisfaction prompt
      if (msg.isAutomated && !msg.hideSatisfaction) {
        bodyHtml += `
          <div class="chat-satisfaction-section">
            <div class="chat-satisfaction-title">Was this information helpful?</div>
            <div class="chat-satisfaction-actions">
              <button type="button" class="chat-sat-btn btn-sat-yes" data-action="feedback_satisfied">👍 Yes, thank you</button>
              <button type="button" class="chat-sat-btn btn-sat-other" data-action="show_menu">🔄 Other questions</button>
              <button type="button" class="chat-sat-btn btn-sat-escalate" data-action="live_human">🔴 Not satisfied? Chat with Live Desk</button>
            </div>
          </div>
        `;
      }
    } else {
      bodyHtml = this.escapeHtml(msg.text);
    }

    row.innerHTML = `
      <div class="chat-msg-meta">
        <span>${senderDisplay}</span>
      </div>
      <div class="chat-msg-bubble">
        ${bodyHtml}
        <span class="chat-msg-time">${timeStr}</span>
      </div>
    `;

    // Bind action buttons inside bubble
    row.querySelectorAll('button.chat-action-btn, button.chat-sat-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const action = btn.getAttribute('data-action');
        const payload = btn.getAttribute('data-payload');
        this.handleInlineAction(action, payload, btn.textContent.trim());
      });
    });

    // Insert before typing indicator if present
    if (this.typingIndicator) {
      this.messagesContainer.insertBefore(row, this.typingIndicator);
    } else {
      this.messagesContainer.appendChild(row);
    }
  }

  handleInlineAction(action, payload, label) {
    if (action === 'live_human') {
      this.activateLiveHumanMode(true);
    } else if (action === 'feedback_satisfied') {
      this.handleSatisfactionFeedback();
    } else if (action === 'show_menu') {
      this.toggleSuggestions(true);
    } else if (action === 'request_callback') {
      if (this.isLiveHumanMode) {
        this.sendCustomMessage('I would like to request an executive phone call-back.');
      } else {
        this.askAutomatedQuestion('I would like to request an executive phone call-back.');
      }
    } else if (action === 'send_prompt') {
      if (this.isLiveHumanMode) {
        this.sendCustomMessage(payload || label);
      } else {
        this.askAutomatedQuestion(payload || label);
      }
    } else {
      if (this.isLiveHumanMode) {
        this.sendCustomMessage(label);
      } else {
        this.askAutomatedQuestion(label);
      }
    }
  }

  handleSatisfactionFeedback() {
    const ackMsg = {
      id: 'ack_' + Date.now(),
      sessionId: this.sessionId,
      sender: 'admin',
      senderName: '🤖 Rayan Automated Advisory',
      text: 'Thank you for your feedback! We are glad this information helped.\n\nIf you have further questions or need bespoke engineering solutions, you can select another topic above or connect directly to our **Live Assistance Desk** anytime.',
      actions: [
        { label: '🔄 Ask Another Question', action: 'show_menu' },
        { label: '💬 Connect to Live Assistance Chat', action: 'live_human', isLive: true }
      ],
      timestamp: Date.now(),
      isAutomated: true,
      hideSatisfaction: true
    };
    this.messages.push(ackMsg);
    this.saveCachedMessages();
    this.appendMessageToDom(ackMsg);
    this.scrollToBottom();
  }

  scrollToBottom() {
    if (this.messagesContainer) {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
  }

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  async sendVisitorMessage() {
    if (!this.inputField) return;
    const text = this.inputField.value.trim();
    if (!text) return;
    this.inputField.value = '';
    await this.sendCustomMessage(text);
  }

  async sendCustomMessage(text) {
    this.touchActiveTimestamp();
    const msg = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      sessionId: this.sessionId,
      sender: 'visitor',
      senderName: this.visitorName,
      text: text,
      timestamp: Date.now(),
      page: window.location.pathname
    };

    if (!this.isMessageInList(msg, this.messages)) {
      this.messages.push(msg);
      this.saveCachedMessages();
      this.appendMessageToDom(msg);
      this.scrollToBottom();
    }

    // Save/update session in local index for instant admin panel detection
    this.updateLocalSessionIndex(msg);

    // Broadcast across same-machine tabs
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type: 'VISITOR_MESSAGE', message: msg, sessionId: this.sessionId });
    }

    // Send to backend API with matching ID and timestamp
    try {
      const endpoint = (window.location.pathname.startsWith('/site') ? '/site' : '') + '/api/chat';
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          id: msg.id,
          timestamp: msg.timestamp,
          sessionId: this.sessionId,
          text: text,
          sender: 'visitor',
          senderName: this.visitorName,
          page: window.location.pathname,
          visitorInfo: { name: this.visitorName }
        })
      }).catch(() => {});
    } catch (err) {
      console.warn('Live chat remote dispatch fallback:', err);
    }

    // Ensure email notification was dispatched to rayan@rayan-group.com
    const notifKey = `rayan_chat_email_notified_${this.sessionId}`;
    if (!sessionStorage.getItem(notifKey)) {
      this.notifyChatOpened('first_message', text);
    }

    // Trigger Automated Reply System
    this.triggerAutomatedReply(text);
  }

  // ============================================================================
  // AUTOMATED REPLY ENGINE
  // Context-aware knowledge base matching Rayan Group operations & divisions
  // ============================================================================
  generateAutomatedResponse(rawText) {
    const text = (rawText || '').toLowerCase().trim();

    // 1. Executive Directors & Leadership
    if (
      text.includes('executive') || text.includes('director') || text.includes('board') ||
      text.includes('leadership') || text.includes('management') || text.includes('arshad') ||
      text.includes('sadaf') || text.includes('bakhteyar') || text.includes('nadeem') || text.includes('khalid')
    ) {
      return {
        text: "Thank you for requesting to connect with the **Executive Leadership of Rayan Group & Ashaz Engineering**.\n\nOur Executive Directorate operates directly across the UAE and South Asia:\n• **Founder & Chairman:** Mr. Arshad Alam Shaikh\n• **Chief Executive Officer:** Mrs. Sadaf Fatma (UAE & India)\n• **Chief Operating Officer:** Eng. Bakhteyar Alam\n• **Chief Financial Officer:** Eng. Nadeem Akhtar\n• **Direct Corporate Secretariat:** rayan@rayan-group.com\n• **Executive Line:** +971-25654497 (UAE) | +91-9973086910 (India Hub)\n\nYou may initiate a **Live Human Agent** chat right now, or request a priority executive callback.",
        actions: [
          { label: '💬 Chat with Live Human Agent', action: 'live_human', isLive: true },
          { label: '📞 Request Executive Callback', action: 'request_callback' },
          { label: '✉️ Email rayan@rayan-group.com', url: 'mailto:rayan@rayan-group.com' }
        ]
      };
    }

    // 2. Tender / RFP / Commercial Proposal / Estimation / BOQ / Pricing
    if (
      text.includes('tender') || text.includes('rfp') || text.includes('proposal') ||
      text.includes('quote') || text.includes('quotation') || text.includes('pricing') ||
      text.includes('cost') || text.includes('boq') || text.includes('budget') || text.includes('bidding')
    ) {
      return {
        text: "Our **Commercial & Technical Estimating Committee** reviews project parameters and turnkey RFP submissions within 24–48 hours.\n\nDirect Regional Routing:\n• **Dubai & UAE Commercial HQ:** tender@rayan-group.com\n• **South Asia Regional Hub (India):** ashaz@rayan-group.com\n\nWould you like to open our official Tender RFP submission portal to upload BOQ and drawings, or speak with an estimating officer?",
        actions: [
          { label: '📝 Open Tender RFP Portal', url: '/proposal/' },
          { label: '💬 Chat with Live Human Agent', action: 'live_human', isLive: true },
          { label: '✉️ Email tender@rayan-group.com', url: 'mailto:tender@rayan-group.com' }
        ]
      };
    }

    // 3. Civil Construction & High-Rise / Commercial Contracting / Fit-Out
    if (
      text.includes('civil') || text.includes('high-rise') || text.includes('construction') ||
      text.includes('contracting') || text.includes('fit-out') || text.includes('fitout') ||
      text.includes('interior') || text.includes('villa') || text.includes('building')
    ) {
      return {
        text: "**Rayan Engineering & Contracting L.L.C** is our flagship civil delivery arm with 500+ executed landmark projects across the UAE.\n\nCore Capabilities:\n• Turnkey Commercial High-Rise Towers & Mixed-Use Frameworks\n• 5-Star Luxury Hospitality Overhauls (e.g., Waldorf Astoria RAK)\n• Retail & Anchor Fit-Out (Yas Mall, Dubai Hills, MBZ Mall)\n• Bespoke Coastal Residential & Luxury Marble Works (Palm Jumeirah)",
        actions: [
          { label: '🏢 Explore Executed Projects', url: '/projects/' },
          { label: '📝 Submit Civil Tender RFP', url: '/proposal/' },
          { label: '💬 Chat with Live Human Agent', action: 'live_human', isLive: true }
        ]
      };
    }

    // 4. Energy & Process Infrastructure / Pipelines / Oil & Gas
    if (
      text.includes('energy') || text.includes('oil') || text.includes('gas') ||
      text.includes('pipeline') || text.includes('piping') || text.includes('process') ||
      text.includes('refinery') || text.includes('substation') || text.includes('tank')
    ) {
      return {
        text: "**Rayan Energy L.L.C** delivers mission-critical EPC solutions across the Arabian Gulf & South Asia.\n\nCapabilities:\n• Hydrocarbon Transport Pipelines & Metering Skids\n• Process Facilities, Storage Tank Farms & Terminal Turnarounds\n• High-Voltage Substations & Industrial Power Utilities\n• Rigorous ISO 45001 Zero-Harm Safety Record",
        actions: [
          { label: '⚡ Energy Division Overview', url: '/business/energy/' },
          { label: '📝 Submit Energy Scope RFP', url: '/proposal/' },
          { label: '💬 Chat with Live Human Agent', action: 'live_human', isLive: true }
        ]
      };
    }

    // 5. Billing & Vendor Accounts / Invoices / Payments
    if (
      text.includes('billing') || text.includes('invoice') || text.includes('account') ||
      text.includes('payment') || text.includes('remittance') || text.includes('ledger') ||
      text.includes('soa') || text.includes('statement')
    ) {
      return {
        text: "For vendor invoice status verification, remittance advice, and ledger reconciliation:\n• **Accounts Desk:** accounts@rayan-group.com\n• **Direct Line:** +971-25654497 (Ext. 204)\n• **Online Portal:** /billing/\n\nOur finance department operates bi-monthly electronic payment disbursements for verified purchase orders.",
        actions: [
          { label: '💳 Open Billing & Accounts Desk', url: '/billing/' },
          { label: '💬 Chat with Live Human Agent', action: 'live_human', isLive: true }
        ]
      };
    }

    // 6. Procurement & Suppliers / Approved Vendor List (AVL)
    if (
      text.includes('vendor') || text.includes('supplier') || text.includes('procurement') ||
      text.includes('avl') || text.includes('prequal') || text.includes('material') || text.includes('subcontract')
    ) {
      return {
        text: "Vendor registration and approved supplier onboarding are managed by our central procurement division:\n• **Procurement Desk:** vendors@rayan-group.com\n• **Online Portal:** /procurement/\n\nPlease submit your trade license, TRN tax certificate, and corporate capabilities brochure for prequalification audit.",
        actions: [
          { label: '📦 Open Procurement Portal', url: '/procurement/' },
          { label: '💬 Chat with Live Human Agent', action: 'live_human', isLive: true }
        ]
      };
    }

    // 7. Careers & Recruitment / Job Vacancies
    if (
      text.includes('career') || text.includes('job') || text.includes('recruitment') ||
      text.includes('hiring') || text.includes('vacancy') || text.includes('apply') ||
      text.includes('resume') || text.includes('cv')
    ) {
      return {
        text: "Rayan Group and Ashaz Engineering welcome qualified engineers and project management professionals across UAE and India.\n\nPlease forward your CV directly to **recruitment@rayan-group.com** or explore our open positions on the careers portal.",
        actions: [
          { label: '💼 Browse Open Careers', url: '/careers/' },
          { label: '✉️ Email recruitment@rayan-group.com', url: 'mailto:recruitment@rayan-group.com' }
        ]
      };
    }

    // 8. Locations & Dual Headquarters / Contact Info
    if (
      text.includes('location') || text.includes('office') || text.includes('address') ||
      text.includes('where') || text.includes('abu dhabi') || text.includes('dubai') ||
      text.includes('india') || text.includes('bettiah') || text.includes('phone')
    ) {
      return {
        text: "Rayan Group operates dual international operational hubs:\n• **UAE Corporate HQ:** Office No. 09, Plot 42, Mussafah M-36, Abu Dhabi, UAE (Phone: +971-25654497)\n• **South Asia Regional Hub:** Ashaz Engineering, Bettiah / New Delhi, India (Phone: +91-9973086910)\n\nBoth hubs coordinate turnkey contracting, technical engineering, and regional estimation.",
        actions: [
          { label: '📍 View Dual HQ Contacts', url: '/contact/' },
          { label: '💬 Chat with Live Human Agent', action: 'live_human', isLive: true }
        ]
      };
    }

    // 9. ISO Certifications & HSE Safety
    if (
      text.includes('iso') || text.includes('certif') || text.includes('safety') ||
      text.includes('hse') || text.includes('quality') || text.includes('standard')
    ) {
      return {
        text: "Rayan Group holds global **Triple ISO Certifications** fully audited and verified:\n• **ISO 9001:2015** (Quality Management Systems)\n• **ISO 14001:2015** (Environmental Safety & Stewardship)\n• **ISO 45001:2018** (Occupational Health & Safety Zero-Harm Standards)",
        actions: [
          { label: '🌱 View HSE & Sustainability', url: '/sustainability/' },
          { label: '💬 Chat with Live Human Agent', action: 'live_human', isLive: true }
        ]
      };
    }

    // 10. Direct Live Human Agent Request
    if (
      text.includes('human') || text.includes('agent') || text.includes('representative') ||
      text.includes('operator') || text.includes('real person') || text.includes('person') ||
      text.includes('live chat') || text.includes('custom chat') || text.includes('help')
    ) {
      return {
        text: "Connecting you directly to our **Live Human Agent** queue.\n\nA duty commercial specialist has been notified with high priority. Please feel free to type your custom questions or project details below, and an officer will assist you immediately.",
        actions: [
          { label: '📞 Call UAE HQ: +971-25654497', url: 'tel:+971-25654497' },
          { label: '✉️ Email rayan@rayan-group.com', url: 'mailto:rayan@rayan-group.com' }
        ],
        activateLiveAgent: true
      };
    }

    // 11. Greetings
    if (
      text === 'hi' || text === 'hii' || text === 'hello' || text === 'hey' || text === 'salam' ||
      text.startsWith('hi ') || text.startsWith('hello ') || text.includes('good morning') ||
      text.includes('good afternoon') || text.includes('good evening')
    ) {
      return {
        text: "Hello! Welcome to **Rayan Group Executive Assistance**. I am your automated digital advisor.\n\nWe deliver landmark civil engineering, energy EPC, and turnkey contracting across the UAE and South Asia.\n\nHow can we assist you today? You can choose a quick topic below or type your custom inquiry for our live team.",
        actions: [
          { label: '📝 Request Tender Proposal / RFP', url: '/proposal/' },
          { label: '🏛️ Connect with Executive Director', action: 'send_prompt', payload: 'I would like to connect with the Executive Directors.' },
          { label: '🏢 Civil & High-Rise EPC', action: 'send_prompt', payload: 'Inquiry regarding Civil Construction & High-Rise contracting.' },
          { label: '⚡ Energy & Infrastructure', action: 'send_prompt', payload: 'Inquiry regarding Energy Facilities & Process Pipelines.' },
          { label: '💬 Chat with Live Human Agent', action: 'live_human', isLive: true }
        ]
      };
    }

    // 12. Fallback / Custom Live Chat Option when options run out
    return {
      text: "Thank you for sharing your inquiry. I have recorded your details for our commercial operations desk.\n\nTo discuss customized engineering specifications, schedules, or pricing, you can chat directly with our **Live Human Agent** right now, or request an executive call-back.",
      actions: [
        { label: '💬 Chat with Live Human Agent', action: 'live_human', isLive: true },
        { label: '📞 Request Executive Callback', action: 'request_callback' },
        { label: '📝 Submit Official RFP Form', url: '/proposal/' },
        { label: '✉️ Email rayan@rayan-group.com', url: 'mailto:rayan@rayan-group.com' }
      ]
    };
  }

  triggerAutomatedReply(userText) {
    if (this.automatedReplyTimeout) {
      clearTimeout(this.automatedReplyTimeout);
    }

    // Show typing indicator
    if (this.typingIndicator) {
      this.typingIndicator.style.display = 'flex';
      this.scrollToBottom();
    }

    const replyData = this.generateAutomatedResponse(userText);

    // Natural responsive delay (600ms - 1100ms)
    const delay = Math.min(1100, Math.max(650, (userText.length * 12)));

    this.automatedReplyTimeout = setTimeout(() => {
      if (this.typingIndicator) {
        this.typingIndicator.style.display = 'none';
      }

      const replyMsg = {
        id: 'reply_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
        sessionId: this.sessionId,
        sender: 'admin',
        senderName: '🏛️ Rayan Executive Desk',
        text: replyData.text,
        actions: replyData.actions || [],
        timestamp: Date.now(),
        isAutomated: true
      };

      if (!this.isMessageInList(replyMsg, this.messages)) {
        this.messages.push(replyMsg);
        this.saveCachedMessages();
        this.appendMessageToDom(replyMsg);
        this.scrollToBottom();
        this.playChime();
      }

      // Also dispatch to API so admin dashboard has the complete record
      try {
        const endpoint = (window.location.pathname.startsWith('/site') ? '/site' : '') + '/api/chat';
        fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'send',
            id: replyMsg.id,
            timestamp: replyMsg.timestamp,
            sessionId: this.sessionId,
            text: replyMsg.text,
            sender: 'admin',
            senderName: replyMsg.senderName,
            page: window.location.pathname
          })
        }).catch(() => {});
      } catch (e) {}

      // If user specifically requested human live agent, activate it
      if (replyData.activateLiveAgent) {
        this.activateLiveHumanMode(false);
      }
    }, delay);
  }

  // ============================================================================
  // CUSTOM LIVE CHAT HUMAN AGENT MODE
  // Allows customer to switch to live human conversation when options run out
  // ============================================================================
  activateLiveHumanMode(notifyUser = true) {
    this.isLiveHumanMode = true;
    localStorage.setItem(`rayan_chat_live_mode_${this.sessionId}`, 'true');

    // High-priority notification dispatched to rayan@rayan-group.com
    this.notifyChatOpened('live_human', 'Client requested Live Human Agent assistance from the live chat desk.');

    // Update UI elements: hide locked bar, show live composer and profile bar
    if (this.lockedBar) this.lockedBar.style.display = 'none';
    if (this.composerWrap) this.composerWrap.style.display = 'block';
    if (this.profileBar) this.profileBar.style.display = 'flex';

    // Update status in header
    const statusText = document.querySelector('.chat-agent-status-text');
    if (statusText) {
      statusText.innerHTML = '<span style="color:#10b981;">●</span> Live Agent Connected • Direct Queue';
    }
    const pulse = document.querySelector('.chat-agent-pulse');
    if (pulse) {
      pulse.style.background = '#10b981';
      pulse.style.boxShadow = '0 0 10px #10b981';
    }

    // Show live mode banner above messages
    let banner = document.getElementById('chat-live-mode-banner');
    if (!banner && this.chatView) {
      banner = document.createElement('div');
      banner.id = 'chat-live-mode-banner';
      banner.className = 'chat-live-mode-banner';
      banner.innerHTML = `
        <span>🟢 Custom Live Chat Active • Duty Officer Alerted</span>
        <div style="display:flex; gap:0.4rem; align-items:center;">
          <button type="button" class="chat-toggle-topics-btn" id="chat-toggle-topics-btn">Show Topics</button>
          <button type="button" class="chat-toggle-topics-btn" id="chat-banner-new-chat-btn" style="border-color: rgba(255,255,255,0.25); color: #fff;">🔄 New Chat</button>
        </div>
      `;
      const header = this.chatView.querySelector('.chat-room-header');
      if (header && header.nextSibling) {
        this.chatView.insertBefore(banner, header.nextSibling);
      }
      banner.querySelector('#chat-toggle-topics-btn').addEventListener('click', () => {
        this.toggleSuggestions();
      });
      banner.querySelector('#chat-banner-new-chat-btn').addEventListener('click', () => {
        if (confirm('Start a new chat session? This will clear your current conversation and start fresh.')) {
          this.resetSession(true);
        }
      });
    } else if (banner) {
      banner.style.display = 'flex';
    }

    // Hide suggestions to give customer clean custom chat space
    const suggestions = document.querySelector('.chat-suggestions-wrap');
    if (suggestions) {
      suggestions.style.display = 'none';
    }

    // Update session index for admin panel
    try {
      let list = JSON.parse(localStorage.getItem('rayan_chat_sessions_index') || '[]');
      let session = list.find(s => s.id === this.sessionId);
      if (session) {
        session.liveAgentRequested = true;
        session.status = 'live_agent';
        localStorage.setItem('rayan_chat_sessions_index', JSON.stringify(list));
      }
    } catch (e) {}

    // Broadcast priority notice across tabs
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({
        type: 'LIVE_AGENT_REQUESTED',
        sessionId: this.sessionId,
        visitorName: this.visitorName
      });
    }

    if (notifyUser) {
      const liveNoticeMsg = {
        id: 'desk_live_' + Date.now(),
        sessionId: this.sessionId,
        sender: 'admin',
        senderName: '🏛️ Rayan Executive Desk',
        text: 'You are now connected directly to our **Live Human Agent** queue.\n\nA duty commercial specialist has been alerted with high priority. Please feel free to type your custom questions, project requirements, or tender RFPs below, and an officer will assist you.',
        actions: [
          { label: '📞 Call UAE HQ: +971-25654497', url: 'tel:+971-25654497' },
          { label: '✉️ Direct Email (rayan@rayan-group.com)', url: 'mailto:rayan@rayan-group.com' },
          { label: '🔄 Show Topic Options', action: 'show_menu' }
        ],
        timestamp: Date.now(),
        isAutomated: false
      };
      this.messages.push(liveNoticeMsg);
      this.saveCachedMessages();
      this.appendMessageToDom(liveNoticeMsg);
      this.scrollToBottom();
      this.playChime();
    }

    if (this.inputField) {
      this.inputField.placeholder = 'Type your custom message to live agent...';
      this.inputField.focus();
    }
  }

  toggleSuggestions(forceShow) {
    const wrap = document.querySelector('.chat-suggestions-wrap');
    const toggleBtn = document.getElementById('chat-toggle-topics-btn');
    if (!wrap) return;
    const isHidden = (wrap.style.display === 'none');
    const shouldShow = typeof forceShow === 'boolean' ? forceShow : isHidden;
    wrap.style.display = shouldShow ? 'flex' : 'none';
    if (toggleBtn) {
      toggleBtn.textContent = shouldShow ? 'Hide Topics' : 'Show Topics';
    }
    this.scrollToBottom();
  }

  updateLocalSessionIndex(lastMsg) {
    try {
      let list = JSON.parse(localStorage.getItem('rayan_chat_sessions_index') || '[]');
      let session = list.find(s => s.id === this.sessionId);
      if (!session) {
        session = {
          id: this.sessionId,
          visitorName: this.visitorName || 'Website Visitor',
          page: window.location.pathname || '/',
          createdAt: Date.now(),
          lastActivity: Date.now(),
          lastMessage: lastMsg.text,
          unreadForAdmin: 1,
          unreadForVisitor: 0,
          status: this.isLiveHumanMode ? 'live_agent' : 'active'
        };
        list.unshift(session);
      } else {
        session.lastActivity = Date.now();
        session.lastMessage = lastMsg.text;
        session.unreadForAdmin = (session.unreadForAdmin || 0) + 1;
        session.page = window.location.pathname || session.page;
        session.visitorName = this.visitorName || session.visitorName;
      }
      localStorage.setItem('rayan_chat_sessions_index', JSON.stringify(list));
    } catch (e) {}
  }

  handleBroadcastMessage(data) {
    if (!data || data.sessionId !== this.sessionId) return;

    if (data.type === 'ADMIN_REPLY') {
      const msg = data.message;
      if (!this.isMessageInList(msg, this.messages)) {
        this.messages.push(msg);
        this.saveCachedMessages();
        this.appendMessageToDom(msg);
        this.scrollToBottom();
        this.playChime();
        this.notifyVisitorReply();
      }
    }
  }

  notifyVisitorReply() {
    if (this.chatView && this.chatView.classList.contains('view-hidden')) {
      if (this.unreadBadge) {
        this.unreadBadge.style.display = 'flex';
        this.unreadBadge.textContent = '1';
      }
    }
  }

  clearUnreadBadge() {
    if (this.unreadBadge) {
      this.unreadBadge.style.display = 'none';
    }
  }

  startPolling() {
    if (this.pollInterval) clearInterval(this.pollInterval);

    const poll = async () => {
      try {
        const lastTs = this.messages.length > 0 ? this.messages[this.messages.length - 1].timestamp : 0;
        const endpoint = (window.location.pathname.startsWith('/site') ? '/site' : '') + `/api/chat?action=poll&sessionId=${encodeURIComponent(this.sessionId)}&since=${lastTs}`;
        const res = await fetch(endpoint);
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && Array.isArray(data.messages) && data.messages.length > 0) {
          let hasNewAdminMsg = false;
          data.messages.forEach(rawMsg => {
            const msg = {
              id: rawMsg.id || rawMsg.msg_id || ('msg_' + (rawMsg.timestamp || Date.now())),
              sessionId: rawMsg.sessionId || rawMsg.session_id || this.sessionId,
              sender: rawMsg.sender || 'visitor',
              senderName: rawMsg.senderName || rawMsg.sender_name || (rawMsg.sender === 'admin' ? '🏛️ Executive Desk' : 'Visitor'),
              text: rawMsg.text || rawMsg.message_text || '',
              timestamp: typeof rawMsg.timestamp === 'number' ? rawMsg.timestamp : (parseInt(rawMsg.timestamp, 10) || Date.now())
            };
            if (msg.text && !this.isMessageInList(msg, this.messages)) {
              this.messages.push(msg);
              this.appendMessageToDom(msg);
              if (msg.sender === 'admin') hasNewAdminMsg = true;
            }
          });
          this.saveCachedMessages();
          this.scrollToBottom();

          if (hasNewAdminMsg) {
            this.playChime();
            this.notifyVisitorReply();
            if (!this.isLiveHumanMode) {
              this.activateLiveHumanMode(false);
            }
          }
        }
      } catch (err) {
        // Polling silent fallback
      }
    };

    this.pollInterval = setInterval(poll, 2500);
  }
}

// Global initialization helper
export function initLiveAssistanceChat() {
  const chat = new LiveAssistanceChat();
  chat.init();
  window.__rayanLiveChat = chat;
  return chat;
}
