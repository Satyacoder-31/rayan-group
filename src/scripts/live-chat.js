// ============================================================================
// RAYAN GROUP — LIVE ASSISTANCE CHAT CONTROLLER
// Real-Time Visitor Live Assistance & Corporate Executive Desk Sync
// ============================================================================

class LiveAssistanceChat {
  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.visitorName = localStorage.getItem('rayan_chat_visitor_name') || 'Guest Visitor';
    this.isMuted = localStorage.getItem('rayan_chat_muted') === 'true';
    this.audioCtx = null;
    this.pollInterval = null;
    this.messages = [];
    this.lastPolledTimestamp = 0;
    this.broadcastChannel = null;

    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('rayan_live_desk_channel');
        this.broadcastChannel.onmessage = (event) => this.handleBroadcastMessage(event.data);
      } catch (e) {
        console.warn('BroadcastChannel not supported', e);
      }
    }
  }

  getOrCreateSessionId() {
    let id = localStorage.getItem('rayan_chat_session_id');
    if (!id) {
      id = 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 6);
      localStorage.setItem('rayan_chat_session_id', id);
    }
    return id;
  }

  init() {
    this.bindDomElements();
    this.bindEvents();
    this.loadCachedMessages();
    this.startPolling();
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

    // Chat elements
    this.messagesContainer = document.getElementById('chat-messages-container');
    this.composerForm = document.getElementById('chat-composer-form');
    this.inputField = document.getElementById('chat-input-field');
    this.sendBtn = document.getElementById('chat-send-btn');
    this.visitorNameInput = document.getElementById('chat-visitor-name-input');
    this.typingIndicator = document.getElementById('chat-typing-indicator');

    if (this.visitorNameInput) {
      this.visitorNameInput.value = this.visitorName === 'Guest Visitor' ? '' : this.visitorName;
    }
  }

  bindEvents() {
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
        this.sendCustomMessage(`Inquiry regarding: ${text}`);
      });
    });

    // Quick suggestions inside chat
    document.querySelectorAll('.chat-suggestion-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        const text = chip.getAttribute('data-prompt') || chip.textContent.trim();
        this.sendCustomMessage(text);
      });
    });
  }

  switchToChatView() {
    if (this.menuView) this.menuView.classList.add('view-hidden');
    if (this.chatView) this.chatView.classList.remove('view-hidden');
    this.clearUnreadBadge();
    if (this.inputField) this.inputField.focus();
    this.scrollToBottom();
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
    } catch (e) {
      // Audio playback blocked or unavailable
    }
  }

  isMessageInList(msg, list) {
    if (!msg || !Array.isArray(list)) return false;
    return list.some(m => {
      if (m.id && msg.id && m.id === msg.id) return true;
      if (m.sender === msg.sender && m.text.trim() === msg.text.trim()) {
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
        if (clone.textContent.trim() === msg.text.trim()) return true;
      }
      return false;
    });
    if (domHasMsg) return;

    const row = document.createElement('div');
    row.className = `chat-msg-row ${msg.sender === 'admin' ? 'msg-desk' : 'msg-visitor'}`;
    row.id = msg.id;

    const timeStr = new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const senderDisplay = msg.sender === 'admin' ? '🏛️ Rayan Executive Desk' : (msg.senderName || 'You');

    row.innerHTML = `
      <div class="chat-msg-meta">
        <span>${senderDisplay}</span>
      </div>
      <div class="chat-msg-bubble">
        ${this.escapeHtml(msg.text)}
        <span class="chat-msg-time">${timeStr}</span>
      </div>
    `;

    // Insert before typing indicator if present
    if (this.typingIndicator) {
      this.messagesContainer.insertBefore(row, this.typingIndicator);
    } else {
      this.messagesContainer.appendChild(row);
    }
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
      await fetch('/api/chat', {
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
      });
    } catch (err) {
      console.warn('Live chat remote dispatch fallback:', err);
    }
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
          status: 'active'
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
        const res = await fetch(`/api/chat?action=poll&sessionId=${encodeURIComponent(this.sessionId)}&since=${lastTs}`);
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && Array.isArray(data.messages) && data.messages.length > 0) {
          let hasNewAdminMsg = false;
          data.messages.forEach(msg => {
            if (!this.isMessageInList(msg, this.messages)) {
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
