// L3UI Framework JavaScript
class L3UI {
  constructor() {
    this.version = '1.0.0';
    this.theme = this.getTheme();
    this.init();
  }

  init() {
    this.applyTheme(this.theme);
    this.setupEventListeners();
    this.setupMotionPreferences();
  }

  // Theme management
  getTheme() {
    const saved = localStorage.getItem('ld-theme');
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (saved) return saved;
    return systemDark ? 'dark' : 'light';
  }

  setTheme(theme) {
    this.theme = theme;
    localStorage.setItem('ld-theme', theme);
    this.applyTheme(theme);
    this.dispatchEvent('themeChange', { theme });
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  toggleTheme() {
    const newTheme = this.theme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  // Customization API
  updateToken(token, value) {
    document.documentElement.style.setProperty(`--ld-${token}`, value);
  }

  updateBrandColor(hex) {
    this.updateToken('brand', hex);
    // Update related brand colors
    const shades = this.generateColorShades(hex);
    Object.entries(shades).forEach(([shade, color]) => {
      this.updateToken(`brand-${shade}`, color);
    });
  }

  updateBorderRadius(value) {
    this.updateToken('radius', value);
    this.updateToken('radius-sm', `calc(${value} * 0.33)`);
    this.updateToken('radius-lg', `calc(${value} * 1.5)`);
  }

  updateFontFamily(font) {
    this.updateToken('font', font);
  }

  generateColorShades(hex) {
    // Simple color shade generation - in practice, you might want a more sophisticated approach
    return {
      '50': this.adjustColor(hex, 0.95),
      '100': this.adjustColor(hex, 0.85),
      '200': this.adjustColor(hex, 0.7),
      '300': this.adjustColor(hex, 0.5),
      '400': this.adjustColor(hex, 0.3),
      '500': hex,
      '600': this.adjustColor(hex, -0.1),
      '700': this.adjustColor(hex, -0.2),
      '800': this.adjustColor(hex, -0.3),
      '900': this.adjustColor(hex, -0.4)
    };
  }

  adjustColor(hex, factor) {
    // Simple color adjustment - consider using a color library for production
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);

    r = Math.min(255, Math.max(0, r + Math.round(r * factor)));
    g = Math.min(255, Math.max(0, g + Math.round(g * factor)));
    b = Math.min(255, Math.max(0, b + Math.round(b * factor)));

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  // Motion preferences
  setupMotionPreferences() {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    this.handleMotionPreference(reducedMotion);
    reducedMotion.addEventListener('change', (e) => this.handleMotionPreference(e));
  }

  handleMotionPreference(mq) {
    if (mq.matches) {
      document.documentElement.classList.add('ld-reduced-motion');
    } else {
      document.documentElement.classList.remove('ld-reduced-motion');
    }
  }

  // Component utilities
  createModal(options) {
    const modal = new L3UIModal(options);
    return modal;
  }

  createToast(message, type = 'info', duration = 5000) {
    const toast = new L3UIToast(message, type, duration);
    return toast;
  }

  // Event system
  dispatchEvent(name, detail) {
    const event = new CustomEvent(`ld:${name}`, { detail });
    document.dispatchEvent(event);
  }

  on(event, callback) {
    document.addEventListener(`ld:${event}`, callback);
  }

  off(event, callback) {
    document.removeEventListener(`ld:${event}`, callback);
  }

  // Setup event listeners
  setupEventListeners() {
    // Auto-initialize components with data attributes
    this.autoInitializeComponents();
  }

  autoInitializeComponents() {
    // Initialize modal triggers
    document.querySelectorAll('[data-ld-modal]').forEach(trigger => {
      trigger.addEventListener('click', () => {
        const modalId = trigger.getAttribute('data-ld-modal');
        const modal = document.getElementById(modalId);
        if (modal) {
          modal.classList.add('ld-modal--open');
        }
      });
    });

    // Initialize theme toggles
    document.querySelectorAll('[data-ld-theme-toggle]').forEach(toggle => {
      toggle.addEventListener('click', () => this.toggleTheme());
    });
  }
}

// Modal component
class L3UIModal {
  constructor(options) {
    this.options = {
      title: '',
      content: '',
      showClose: true,
      closeOnBackdrop: true,
      ...options
    };
    this.element = this.createModalElement();
    this.init();
  }

  createModalElement() {
    const modal = document.createElement('div');
    modal.className = 'ld-modal';
    modal.innerHTML = `
      <div class="ld-backdrop"></div>
      <div class="ld-modal__content">
        ${this.options.title ? `
          <div class="ld-modal__header">
            <h2 class="ld-modal__title">${this.options.title}</h2>
            ${this.options.showClose ? '<button class="ld-modal__close">&times;</button>' : ''}
          </div>
        ` : ''}
        <div class="ld-modal__body">
          ${this.options.content}
        </div>
      </div>
    `;
    return modal;
  }

  init() {
    this.backdrop = this.element.querySelector('.ld-backdrop');
    this.closeButton = this.element.querySelector('.ld-modal__close');

    if (this.options.closeOnBackdrop) {
      this.backdrop.addEventListener('click', () => this.close());
    }

    if (this.closeButton) {
      this.closeButton.addEventListener('click', () => this.close());
    }

    document.body.appendChild(this.element);
  }

  open() {
    this.element.classList.add('ld-modal--open');
    document.documentElement.style.overflow = 'hidden';
  }

  close() {
    this.element.classList.remove('ld-modal--open');
    document.documentElement.style.overflow = '';
    
    setTimeout(() => {
      if (this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
    }, 300);
  }
}

// Toast component
class L3UIToast {
  constructor(message, type = 'info', duration = 5000) {
    this.message = message;
    this.type = type;
    this.duration = duration;
    this.element = this.createToastElement();
    this.init();
  }

  createToastElement() {
    const toast = document.createElement('div');
    toast.className = `ld-toast ld-toast--${this.type}`;
    toast.innerHTML = `
      <div class="ld-toast__content">
        <span class="ld-toast__message">${this.message}</span>
        <button class="ld-toast__close">&times;</button>
      </div>
    `;
    return toast;
  }

  init() {
    const container = this.getToastContainer();
    container.appendChild(this.element);

    this.closeButton = this.element.querySelector('.ld-toast__close');
    this.closeButton.addEventListener('click', () => this.close());

    if (this.duration > 0) {
      this.timeout = setTimeout(() => this.close(), this.duration);
    }
  }

  getToastContainer() {
    let container = document.querySelector('.ld-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'ld-toast-container';
      document.body.appendChild(container);
    }
    return container;
  }

  close() {
    this.element.classList.add('ld-toast--closing');
    setTimeout(() => {
      if (this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
    }, 300);
  }
}

// Initialize L3UI when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.L3UI = new L3UI();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { L3UI, L3UIModal, L3UIToast };
}