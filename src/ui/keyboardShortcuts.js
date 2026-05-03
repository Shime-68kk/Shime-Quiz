let keyboardShortcutsInitialized = false;

function isEditableTarget(target) {
  if (!(target instanceof Element)) return false;
  if (target.isContentEditable) return true;

  return Boolean(target.closest([
    'input',
    'textarea',
    'select',
    '[contenteditable="true"]',
    '[contenteditable=""]',
    '[role="textbox"]',
    '[role="searchbox"]'
  ].join(',')));
}

function isVisible(el) {
  if (!el) return false;
  const style = getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

function isBlockingModalOpen() {
  return [
    '#importerModal',
    '#tourOverlay',
    '#tourWelcome',
    '#sheepPopup',
    '#resultOverlay.show'
  ].some(selector => isVisible(document.querySelector(selector)));
}

function getChoiceIndex(event) {
  const choiceByCode = {
    Digit1: 0,
    Digit2: 1,
    Digit3: 2,
    Digit4: 3,
    Numpad1: 0,
    Numpad2: 1,
    Numpad3: 2,
    Numpad4: 3
  };

  if (choiceByCode[event.code] != null) return choiceByCode[event.code];
  if (/^[1-4]$/.test(event.key)) return Number(event.key) - 1;
  return null;
}

export function initKeyboardShortcuts({
  isEnabled,
  onNext,
  onPrevious,
  onSelectChoice
} = {}) {
  if (keyboardShortcutsInitialized) return;
  keyboardShortcutsInitialized = true;

  document.addEventListener('keydown', event => {
    if (event.defaultPrevented) return;
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (isEditableTarget(event.target)) return;
    if (isBlockingModalOpen()) return;
    if (isEnabled && !isEnabled()) return;

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      onNext?.();
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      onPrevious?.();
      return;
    }

    const choiceIndex = getChoiceIndex(event);
    if (choiceIndex == null) return;

    event.preventDefault();
    onSelectChoice?.(choiceIndex);
  });
}
