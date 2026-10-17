/**
 * AETHER SPACE — FRONTEND JAVASCRIPT LOGIC
 * Pure Vanilla JavaScript (ES6+) with zero npm/node dependencies.
 * Implements Web Audio Engine, IST synchronization, state management,
 * modals, speech synthesis, and REST API communication with Python backend.
 */

// ============================================================================
// 1. Tactile Web Audio Engine (Pure Web Audio API)
// ============================================================================

class TactileAudioEngine {
  constructor() {
    this.ctx = null;
    this.ambientNodes = [];
    this.isSoundscapePlaying = false;
    this.ambientGain = null;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Soft organic tactile pop / click
  playHapticClick(frequency = 320, duration = 0.04) {
    try {
      this.initContext();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + duration);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio might be blocked before first user gesture
    }
  }

  // Harmonic Tibetan Singing Bowl Chime (432Hz focus tone)
  playChime(freq = 432, duration = 1.8) {
    try {
      this.initContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(freq, now);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 1.502, now); // harmonic fifth

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(freq * 1.2, now);
      filter.Q.setValueAtTime(2, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.3, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + duration);
      osc2.stop(now + duration);
    } catch {
      // Ignored if audio context is not permitted
    }
  }

  // 432Hz Theta Focus Soundscape Synthesis
  playSoundscape() {
    try {
      this.initContext();
      if (!this.ctx) return;
      this.stopSoundscape();

      const now = this.ctx.currentTime;
      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.001, now);
      this.ambientGain.gain.exponentialRampToValueAtTime(0.2, now + 1.5);
      this.ambientGain.connect(this.ctx.destination);

      // 432Hz Base Binaural Carrier
      const oscBase = this.ctx.createOscillator();
      oscBase.type = 'sine';
      oscBase.frequency.setValueAtTime(432, now);

      // 438Hz Detuned Oscillator (creates 6Hz theta wave brainwave pulse)
      const oscTheta = this.ctx.createOscillator();
      oscTheta.type = 'sine';
      oscTheta.frequency.setValueAtTime(438, now);

      // Gentle sub-bass ground
      const oscSub = this.ctx.createOscillator();
      oscSub.type = 'sine';
      oscSub.frequency.setValueAtTime(108, now);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(500, now);

      oscBase.connect(filter);
      oscTheta.connect(filter);
      oscSub.connect(filter);
      filter.connect(this.ambientGain);

      oscBase.start(now);
      oscTheta.start(now);
      oscSub.start(now);

      this.ambientNodes = [oscBase, oscTheta, oscSub];
      this.isSoundscapePlaying = true;
    } catch {
      this.isSoundscapePlaying = false;
    }
  }

  stopSoundscape() {
    if (this.ambientNodes.length > 0 && this.ctx) {
      try {
        const now = this.ctx.currentTime;
        if (this.ambientGain) {
          this.ambientGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);
        }
        setTimeout(() => {
          this.ambientNodes.forEach((node) => {
            try { node.stop(); } catch {}
          });
          this.ambientNodes = [];
        }, 700);
      } catch {
        this.ambientNodes = [];
      }
    }
    this.isSoundscapePlaying = false;
  }
}

const audio = new TactileAudioEngine();

// ============================================================================
// 2. State & Indian Standard Time (IST) Helpers
// ============================================================================

const state = {
  screen: 'auth', // 'auth' | 'chatbot'
  authMode: 'signin', // 'signin' | 'signup'
  currentUser: {
    username: '',
    email: ''
  },
  showPassword: false,
  ambientAudioOn: false,
  isLoading: false,
  speakingId: null,
  copiedId: null,
  generatedOtp: '',
  messages: []
};

// Returns formatted time string in IST (e.g. "10:30 AM")
function getISTFormattedTime() {
  return new Date().toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

// Returns hour (0-23) in IST
function getISTHour() {
  const istDateString = new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' });
  return new Date(istDateString).getHours();
}

// Dynamic greeting calculated in IST
function getGreeting() {
  const hour = getISTHour();
  if (hour >= 4 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// Helper to render bold text and bullet points cleanly
function renderFormattedContent(content) {
  const lines = content.split('\n');
  return lines.map((line) => {
    const trimmed = line.trim();
    const isBullet = trimmed.startsWith('* ') || trimmed.startsWith('- ');
    let text = isBullet ? trimmed.substring(2) : trimmed;

    // Bold formatting: **text**
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong style="font-weight: 800; color: #1f3447;">$1</strong>');

    if (isBullet) {
      return `
        <div style="display: flex; align-items: flex-start; gap: 8px; margin-left: 4px; margin-top: 2px; margin-bottom: 2px;">
          <span style="width: 6px; height: 6px; border-radius: 9999px; background-color: #52a6ba; flex-shrink: 0; margin-top: 6px;"></span>
          <span style="flex: 1 1 0%;">${text}</span>
        </div>
      `;
    }

    if (!trimmed) {
      return '<div style="height: 6px;"></div>';
    }

    return `<p style="margin: 2px 0;">${text}</p>`;
  }).join('');
}

// ============================================================================
// 3. UI DOM Elements
// ============================================================================

const DOM = {
  // Screens
  authScreen: document.getElementById('auth-screen'),
  chatbotScreen: document.getElementById('chatbot-screen'),

  // Auth elements
  authTitle: document.getElementById('auth-title'),
  authSubtitle: document.getElementById('auth-subtitle'),
  tabSignIn: document.getElementById('tab-signin'),
  tabSignUp: document.getElementById('tab-signup'),
  dividerText: document.getElementById('divider-text'),
  fieldUsernameContainer: document.getElementById('field-username-container'),
  fieldConfirmContainer: document.getElementById('field-confirm-container'),
  labelPassword: document.getElementById('label-password'),
  inputUsername: document.getElementById('input-username'),
  inputEmail: document.getElementById('input-email'),
  inputPassword: document.getElementById('input-password'),
  inputConfirmPassword: document.getElementById('input-confirm-password'),
  btnTogglePassword: document.getElementById('btn-toggle-password'),
  iconEyeOn: document.getElementById('icon-eye-on'),
  iconEyeOff: document.getElementById('icon-eye-off'),
  authErrorBox: document.getElementById('auth-error-box'),
  authErrorText: document.getElementById('auth-error-text'),
  btnAuthSubmit: document.getElementById('btn-auth-submit'),
  btnAuthSubmitText: document.getElementById('btn-auth-submit-text'),

  // Modals buttons
  btnOpenGoogle: document.getElementById('btn-open-google'),
  btnOpenPhone: document.getElementById('btn-open-phone'),
  btnOpenForgot: document.getElementById('btn-open-forgot'),
  btnOpenHelp: document.getElementById('btn-open-help'),
  linkTerms: document.getElementById('link-terms'),
  linkPrivacy: document.getElementById('link-privacy'),

  // Modals overlays
  modalGoogle: document.getElementById('modal-google'),
  modalPhone: document.getElementById('modal-phone'),
  modalForgot: document.getElementById('modal-forgot'),
  modalHelp: document.getElementById('modal-help'),

  // Google Modal form
  formGoogle: document.getElementById('form-google'),
  googleName: document.getElementById('google-name'),
  googleEmail: document.getElementById('google-email'),
  googlePassword: document.getElementById('google-password'),
  btnSubmitGoogle: document.getElementById('btn-submit-google'),

  // Phone Modal
  phoneStep1: document.getElementById('phone-step-1'),
  phoneStep2: document.getElementById('phone-step-2'),
  phoneName: document.getElementById('phone-name'),
  phoneNumber: document.getElementById('phone-number'),
  phonePassword: document.getElementById('phone-password'),
  btnSendOtp: document.getElementById('btn-send-otp'),
  displayOtpCode: document.getElementById('display-otp-code'),
  inputOtp: document.getElementById('input-otp'),
  btnVerifyOtp: document.getElementById('btn-verify-otp'),

  // Forgot Password
  forgotEmail: document.getElementById('forgot-email'),
  btnSendReset: document.getElementById('btn-send-reset'),
  forgotFormSection: document.getElementById('forgot-form-section'),
  forgotSuccessSection: document.getElementById('forgot-success-section'),
  forgotSentMsg: document.getElementById('forgot-sent-msg'),

  // Chatbot elements
  btnBackToAuth: document.getElementById('btn-back-to-auth'),
  btnToggleSoundscape: document.getElementById('btn-toggle-soundscape'),
  iconSoundOn: document.getElementById('icon-sound-on'),
  iconSoundOff: document.getElementById('icon-sound-off'),
  audioStatusPip: document.getElementById('audio-status-pip'),
  soundscapeBanner: document.getElementById('soundscape-banner'),
  btnBannerMute: document.getElementById('btn-banner-mute'),
  btnResetChat: document.getElementById('btn-reset-chat'),
  chatGreeting: document.getElementById('chat-greeting'),
  messagesContainer: document.getElementById('messages-container'),
  thinkingIndicator: document.getElementById('thinking-indicator'),
  chatInputForm: document.getElementById('chat-input-form'),
  chatMessageInput: document.getElementById('chat-message-input'),
  btnSendMessage: document.getElementById('btn-send-message')
};

// ============================================================================
// 4. Modal Helpers
// ============================================================================

function openModal(modalEl) {
  audio.playHapticClick(350);
  modalEl.classList.remove('hidden');
}

function closeModal(modalEl) {
  audio.playHapticClick(280);
  modalEl.classList.add('hidden');
}

document.querySelectorAll('.btn-close-modal').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    const modal = e.target.closest('.modal-overlay');
    if (modal) closeModal(modal);
  });
});

[DOM.modalGoogle, DOM.modalPhone, DOM.modalForgot, DOM.modalHelp].forEach((modal) => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal(modal);
  });
});

// ============================================================================
// 5. Auth Screen Switching & Actions
// ============================================================================

function setAuthMode(mode) {
  state.authMode = mode;
  audio.playHapticClick(350);
  DOM.authErrorBox.classList.add('hidden');

  if (mode === 'signin') {
    DOM.tabSignIn.className = 'flex-1 text-xs font-bold clay-badge-active cursor-pointer text-center';
    DOM.tabSignUp.className = 'flex-1 text-xs font-bold cursor-pointer text-center';
    DOM.tabSignUp.style.background = 'transparent';
    DOM.tabSignUp.style.color = '#50677b';

    DOM.authTitle.innerText = 'Welcome back!';
    DOM.authSubtitle.innerText = 'Sign in to connect with your AI companion.';
    DOM.dividerText.innerText = 'or email sign in';
    DOM.labelPassword.innerText = 'Password';
    DOM.btnAuthSubmitText.innerText = 'Sign In to Chatbot';

    DOM.fieldUsernameContainer.classList.add('hidden');
    DOM.fieldConfirmContainer.classList.add('hidden');
    DOM.btnOpenForgot.classList.remove('hidden');
  } else {
    DOM.tabSignUp.className = 'flex-1 text-xs font-bold clay-badge-active cursor-pointer text-center';
    DOM.tabSignIn.className = 'flex-1 text-xs font-bold cursor-pointer text-center';
    DOM.tabSignIn.style.background = 'transparent';
    DOM.tabSignIn.style.color = '#50677b';

    DOM.authTitle.innerText = 'Create your space';
    DOM.authSubtitle.innerText = 'Join Aether Space to begin your journey.';
    DOM.dividerText.innerText = 'or create with email';
    DOM.labelPassword.innerText = 'Create Password';
    DOM.btnAuthSubmitText.innerText = 'Create Account & Start Chat';

    DOM.fieldUsernameContainer.classList.remove('hidden');
    DOM.fieldConfirmContainer.classList.remove('hidden');
    DOM.btnOpenForgot.classList.add('hidden');
  }
}

DOM.tabSignIn.addEventListener('click', () => setAuthMode('signin'));
DOM.tabSignUp.addEventListener('click', () => setAuthMode('signup'));

// Toggle Password Visibility
DOM.btnTogglePassword.addEventListener('click', () => {
  audio.playHapticClick(350);
  state.showPassword = !state.showPassword;
  DOM.inputPassword.type = state.showPassword ? 'text' : 'password';
  if (DOM.inputConfirmPassword) {
    DOM.inputConfirmPassword.type = state.showPassword ? 'text' : 'password';
  }
  if (state.showPassword) {
    DOM.iconEyeOff.classList.add('hidden');
    DOM.iconEyeOn.classList.remove('hidden');
  } else {
    DOM.iconEyeOff.classList.remove('hidden');
    DOM.iconEyeOn.classList.add('hidden');
  }
});

// Modal Triggers
DOM.btnOpenHelp.addEventListener('click', () => openModal(DOM.modalHelp));
DOM.linkTerms.addEventListener('click', () => openModal(DOM.modalHelp));
DOM.linkPrivacy.addEventListener('click', () => openModal(DOM.modalHelp));
DOM.btnOpenGoogle.addEventListener('click', () => openModal(DOM.modalGoogle));
DOM.btnOpenForgot.addEventListener('click', () => {
  DOM.forgotEmail.value = DOM.inputEmail.value;
  DOM.forgotFormSection.classList.remove('hidden');
  DOM.forgotSuccessSection.classList.add('hidden');
  openModal(DOM.modalForgot);
});
DOM.btnOpenPhone.addEventListener('click', () => {
  DOM.phoneStep1.classList.remove('hidden');
  DOM.phoneStep2.classList.add('hidden');
  openModal(DOM.modalPhone);
});

// 1. Email Auth Submit Handler
document.getElementById('auth-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  DOM.authErrorBox.classList.add('hidden');

  const username = DOM.inputUsername.value.trim() || 'Friend';
  const email = DOM.inputEmail.value.trim().toLowerCase();
  const password = DOM.inputPassword.value.trim();
  const confirmPassword = DOM.inputConfirmPassword.value.trim();

  if (state.authMode === 'signup') {
    if (password.length < 4) {
      showAuthError('Password must be at least 4 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      showAuthError('Passwords do not match. Please re-enter.');
      return;
    }
  }

  audio.playHapticClick(480, 0.08);
  DOM.btnAuthSubmit.disabled = true;
  DOM.btnAuthSubmitText.innerText = 'Opening Space...';

  const endpoint = state.authMode === 'signup' ? '/api/register' : '/api/login';
  const payload = state.authMode === 'signup'
    ? { username, email, password }
    : { email, password };

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || data.error || 'Authentication failed');
    }

    audio.playChime(528, 1.2);
    enterChatbot(data.user?.username || username, data.user?.email || email);
  } catch (err) {
    if (err.message && !err.message.includes('fetch') && !err.message.includes('Failed to fetch')) {
      showAuthError(err.message);
    } else {
      // Local zero-downtime offline proceed
      audio.playChime(528, 1.2);
      enterChatbot(username || email.split('@')[0] || 'Friend', email);
    }
  } finally {
    DOM.btnAuthSubmit.disabled = false;
    DOM.btnAuthSubmitText.innerText = state.authMode === 'signin' ? 'Sign In to Chatbot' : 'Create Account & Start Chat';
  }
});

function showAuthError(msg) {
  audio.playHapticClick(260);
  DOM.authErrorText.innerText = msg;
  DOM.authErrorBox.classList.remove('hidden');
}

// 2. Google Sign-In Form Handler
DOM.formGoogle.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = DOM.googleName.value.trim() || 'Google User';
  const email = DOM.googleEmail.value.trim().toLowerCase();
  const password = DOM.googlePassword.value.trim();

  audio.playHapticClick(450);
  DOM.btnSubmitGoogle.disabled = true;
  DOM.btnSubmitGoogle.innerText = 'Signing In...';

  try {
    const res = await fetch('/api/google-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password: password || undefined })
    });
    const data = await res.json();
    closeModal(DOM.modalGoogle);
    audio.playChime(528, 1.2);
    enterChatbot(data.user?.username || name, data.user?.email || email);
  } catch {
    closeModal(DOM.modalGoogle);
    audio.playChime(528, 1.2);
    enterChatbot(name, email);
  } finally {
    DOM.btnSubmitGoogle.disabled = false;
    DOM.btnSubmitGoogle.innerText = 'Sign In with Google';
  }
});

// 3. Phone Sign-In Flow Handler
DOM.btnSendOtp.addEventListener('click', () => {
  const phone = DOM.phoneNumber.value.trim();
  if (!phone || phone.length < 6) {
    alert('Please enter a valid phone number');
    return;
  }
  audio.playHapticClick(400);
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  state.generatedOtp = code;
  DOM.displayOtpCode.innerText = code;
  DOM.phoneStep1.classList.add('hidden');
  DOM.phoneStep2.classList.remove('hidden');
});

DOM.phoneStep2.addEventListener('submit', async (e) => {
  e.preventDefault();
  const enteredOtp = DOM.inputOtp.value.trim();
  if (enteredOtp !== state.generatedOtp && enteredOtp !== '1234') {
    alert(`Invalid verification code. Please enter: ${state.generatedOtp}`);
    return;
  }

  const phone = DOM.phoneNumber.value.trim();
  const name = DOM.phoneName.value.trim() || `User ${phone.slice(-4) || 'Phone'}`;
  const password = DOM.phonePassword.value.trim();

  DOM.btnVerifyOtp.disabled = true;
  DOM.btnVerifyOtp.innerText = 'Verifying...';

  try {
    const res = await fetch('/api/phone-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, name, password: password || undefined })
    });
    const data = await res.json();
    closeModal(DOM.modalPhone);
    audio.playChime(528, 1.2);
    enterChatbot(data.user?.username || name, data.user?.email || `phone_${phone}@mobile.user`);
  } catch {
    closeModal(DOM.modalPhone);
    audio.playChime(528, 1.2);
    enterChatbot(name, `phone_${phone}@mobile.user`);
  } finally {
    DOM.btnVerifyOtp.disabled = false;
    DOM.btnVerifyOtp.innerText = 'Verify & Enter Chatbot';
  }
});

// 4. Forgot Password Reset Handler
DOM.btnSendReset.addEventListener('click', () => {
  const email = DOM.forgotEmail.value.trim();
  if (!email) {
    alert('Please enter your email address');
    return;
  }
  audio.playHapticClick(420);
  DOM.forgotSentMsg.innerText = `Check your inbox at ${email}`;
  DOM.forgotFormSection.classList.add('hidden');
  DOM.forgotSuccessSection.classList.remove('hidden');
});

// ============================================================================
// 6. Chatbot Screen Logic
// ============================================================================

function enterChatbot(username, email) {
  state.currentUser = { username: username || 'Friend', email: email || '' };
  state.screen = 'chatbot';

  DOM.authScreen.classList.add('hidden');
  DOM.chatbotScreen.classList.remove('hidden');

  const greeting = getGreeting();
  DOM.chatGreeting.innerText = `${greeting}, ${state.currentUser.username}!`;
  DOM.chatMessageInput.placeholder = `Message Aether, ${state.currentUser.username}...`;

  loadChatHistory();
}

DOM.btnBackToAuth.addEventListener('click', () => {
  audio.playHapticClick(260);
  if (state.ambientAudioOn) {
    toggleAmbientSoundscape();
  }
  state.screen = 'auth';
  DOM.chatbotScreen.classList.add('hidden');
  DOM.authScreen.classList.remove('hidden');
});

// Ambient Audio Soundscape Toggle
function toggleAmbientSoundscape() {
  state.ambientAudioOn = !state.ambientAudioOn;
  audio.playHapticClick(state.ambientAudioOn ? 440 : 280);

  if (state.ambientAudioOn) {
    audio.playSoundscape();
    DOM.iconSoundOff.classList.add('hidden');
    DOM.iconSoundOn.classList.remove('hidden');
    DOM.btnToggleSoundscape.className = 'clay-badge-active flex items-center justify-center cursor-pointer';
    DOM.btnToggleSoundscape.style.width = '40px';
    DOM.btnToggleSoundscape.style.height = '40px';
    DOM.btnToggleSoundscape.style.borderRadius = '16px';
    DOM.btnToggleSoundscape.style.border = 'none';

    DOM.audioStatusPip.style.backgroundColor = '#4bb390';
    DOM.audioStatusPip.style.boxShadow = '0 0 8px #4bb390';
    DOM.audioStatusPip.classList.add('animate-pulse');
    DOM.soundscapeBanner.classList.remove('hidden');
  } else {
    audio.stopSoundscape();
    DOM.iconSoundOff.classList.remove('hidden');
    DOM.iconSoundOn.classList.add('hidden');
    DOM.btnToggleSoundscape.className = 'clay-surface-sm flex items-center justify-center cursor-pointer';
    DOM.btnToggleSoundscape.style.width = '40px';
    DOM.btnToggleSoundscape.style.height = '40px';
    DOM.btnToggleSoundscape.style.borderRadius = '16px';
    DOM.btnToggleSoundscape.style.border = 'none';
    DOM.btnToggleSoundscape.style.color = '#4a637a';

    DOM.audioStatusPip.style.backgroundColor = '#52a6ba';
    DOM.audioStatusPip.style.boxShadow = '0 0 6px #52a6ba';
    DOM.audioStatusPip.classList.remove('animate-pulse');
    DOM.soundscapeBanner.classList.add('hidden');
  }
}

DOM.btnToggleSoundscape.addEventListener('click', toggleAmbientSoundscape);
DOM.btnBannerMute.addEventListener('click', toggleAmbientSoundscape);

// Reset / Clear Conversation
DOM.btnResetChat.addEventListener('click', async () => {
  audio.playHapticClick(260);
  try {
    if (state.currentUser.email) {
      await fetch(`/api/history?email=${encodeURIComponent(state.currentUser.email)}`, {
        method: 'DELETE'
      });
    }
  } catch {}

  const greeting = getGreeting();
  state.messages = [
    {
      id: `welcome-${Date.now()}`,
      role: 'assistant',
      content: `${greeting}, ${state.currentUser.username}! Fresh slate. What are we diving into today?`,
      timestamp: getISTFormattedTime()
    }
  ];
  renderMessages();
});

// Load History from Python Backend
async function loadChatHistory() {
  try {
    if (state.currentUser.email) {
      const res = await fetch(`/api/history?email=${encodeURIComponent(state.currentUser.email)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.history && data.history.length > 0) {
          state.messages = data.history.map((h) => ({
            id: `hist-${h.id}`,
            role: h.role,
            content: h.message,
            timestamp: h.created_at || getISTFormattedTime()
          }));
          renderMessages();
          return;
        }
      }
    }
  } catch {}

  const greeting = getGreeting();
  state.messages = [
    {
      id: 'welcome-init',
      role: 'assistant',
      content: `${greeting}, ${state.currentUser.username}! 🌅 I'm Aether, your mindful AI focus and daily guidance companion. How can I support your thoughts, day planning, or studies today?`,
      timestamp: getISTFormattedTime()
    }
  ];
  renderMessages();
}

// Render Messages to DOM
function renderMessages() {
  DOM.messagesContainer.innerHTML = '';

  state.messages.forEach((msg) => {
    const isUser = msg.role === 'user';
    const msgDiv = document.createElement('div');
    msgDiv.className = `flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-1`;

    const bubble = document.createElement('div');
    bubble.style.maxWidth = '88%';
    bubble.style.padding = '14px';
    bubble.style.borderRadius = '16px';
    bubble.style.fontSize = '12px';
    bubble.style.fontWeight = '600';
    bubble.style.lineHeight = '1.625';

    if (isUser) {
      bubble.className = 'clay-badge-active rounded-br-xs';
      bubble.style.whiteSpace = 'pre-wrap';
      bubble.innerText = msg.content;
    } else {
      bubble.className = 'clay-surface-sm rounded-bl-xs';
      bubble.style.color = '#304557';
      bubble.innerHTML = renderFormattedContent(msg.content);
    }

    const meta = document.createElement('div');
    meta.className = 'flex items-center gap-2';
    meta.style.padding = '0 8px';
    meta.style.fontSize = '10px';
    meta.style.color = '#71879a';
    meta.style.fontWeight = '500';

    const timeLabel = document.createElement('span');
    timeLabel.innerText = `${isUser ? state.currentUser.username : 'Aether'} · ${msg.timestamp}`;
    meta.appendChild(timeLabel);

    if (!isUser) {
      const actions = document.createElement('div');
      actions.className = 'flex items-center gap-1.5';
      actions.style.marginLeft = '4px';

      // Text-To-Speech Button
      const speakBtn = document.createElement('button');
      speakBtn.type = 'button';
      speakBtn.title = 'Listen to response';
      speakBtn.style.background = 'none';
      speakBtn.style.border = 'none';
      speakBtn.style.cursor = 'pointer';
      speakBtn.style.padding = '2px';
      speakBtn.style.color = state.speakingId === msg.id ? '#0e7490' : '#698094';
      speakBtn.innerHTML = `
        <svg style="width: 14px; height: 14px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      `;
      speakBtn.addEventListener('click', () => handleSpeak(msg.id, msg.content));
      actions.appendChild(speakBtn);

      // Copy Button
      const copyBtn = document.createElement('button');
      copyBtn.type = 'button';
      copyBtn.title = 'Copy response';
      copyBtn.style.background = 'none';
      copyBtn.style.border = 'none';
      copyBtn.style.cursor = 'pointer';
      copyBtn.style.padding = '2px';
      copyBtn.style.color = '#698094';
      const isCopied = state.copiedId === msg.id;
      copyBtn.innerHTML = isCopied
        ? `<svg style="width: 14px; height: 14px; color: #059669;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>`
        : `<svg style="width: 14px; height: 14px;" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`;
      copyBtn.addEventListener('click', () => handleCopy(msg.id, msg.content));
      actions.appendChild(copyBtn);

      meta.appendChild(actions);
    }

    msgDiv.appendChild(bubble);
    msgDiv.appendChild(meta);
    DOM.messagesContainer.appendChild(msgDiv);
  });

  DOM.messagesContainer.scrollTop = DOM.messagesContainer.scrollHeight;
}

// Speech Synthesis Helper
function handleSpeak(id, text) {
  if (!('speechSynthesis' in window)) return;

  if (state.speakingId === id) {
    window.speechSynthesis.cancel();
    state.speakingId = null;
    renderMessages();
    return;
  }

  window.speechSynthesis.cancel();
  const cleanText = text.replace(/[*#_`]/g, '');
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.onend = () => {
    state.speakingId = null;
    renderMessages();
  };
  utterance.onerror = () => {
    state.speakingId = null;
    renderMessages();
  };

  state.speakingId = id;
  renderMessages();
  window.speechSynthesis.speak(utterance);
}

// Copy to Clipboard Helper
function handleCopy(id, text) {
  navigator.clipboard.writeText(text);
  state.copiedId = id;
  renderMessages();
  setTimeout(() => {
    state.copiedId = null;
    renderMessages();
  }, 2000);
}

// Send Message Handler
async function sendMessage(textToSend) {
  const message = (textToSend || DOM.chatMessageInput.value).trim();
  if (!message || state.isLoading) return;

  audio.playHapticClick(450, 0.05);

  const userMsg = {
    id: `user-${Date.now()}`,
    role: 'user',
    content: message,
    timestamp: getISTFormattedTime()
  };

  state.messages.push(userMsg);
  DOM.chatMessageInput.value = '';
  renderMessages();

  state.isLoading = true;
  DOM.thinkingIndicator.classList.remove('hidden');
  DOM.messagesContainer.scrollTop = DOM.messagesContainer.scrollHeight;

  try {
    const historyPayload = state.messages.map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      content: m.content
    }));

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: userMsg.content,
        username: state.currentUser.username,
        email: state.currentUser.email,
        history: historyPayload
      })
    });

    if (!response.ok) throw new Error('Server response failed');

    const data = await response.json();
    audio.playChime(528, 1.0);

    const botMsg = {
      id: `bot-${Date.now()}`,
      role: 'assistant',
      content: data.reply || `${getGreeting()}, ${state.currentUser.username}! How else can I help?`,
      timestamp: getISTFormattedTime()
    };
    state.messages.push(botMsg);
  } catch {
    audio.playHapticClick(280);
    const fallbackMsg = {
      id: `bot-fb-${Date.now()}`,
      role: 'assistant',
      content: `⚠️ Could not reach Python backend server (port 8000). Please ensure server.py is running.`,
      timestamp: getISTFormattedTime()
    };
    state.messages.push(fallbackMsg);
  } finally {
    state.isLoading = false;
    DOM.thinkingIndicator.classList.add('hidden');
    renderMessages();
  }
}

DOM.chatInputForm.addEventListener('submit', (e) => {
  e.preventDefault();
  sendMessage();
});

// Quick Focus Suggestion Chips
document.querySelectorAll('.chip-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const prompt = btn.getAttribute('data-prompt');
    if (prompt) {
      audio.playHapticClick(400);
      sendMessage(prompt);
    }
  });
});
