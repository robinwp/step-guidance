import { createdEL } from '../share/index';

export default class Highlighter {
  overlay: HTMLElement;
  overlayContent: HTMLElement;
  content: HTMLElement[];

  constructor(content: HTMLElement[]) {
    this.content = content;
    this.overlay = createdEL({
      style: `background-color:rgba(104, 182, 255, 0.35);position: fixed;z-index:9999999;
      pointer-events: none;display:flex;align-items: center;justify-content: center;
      border-radius: 3px`
    });
    // this.overlay = document.createElement('div');
    // this.overlay.style.backgroundColor = 'rgba(104, 182, 255, 0.35)';
    // this.overlay.style.position = 'fixed';
    // this.overlay.style.zIndex = '9999999';
    // this.overlay.style.pointerEvents = 'none';
    // this.overlay.style.display = 'flex';
    // this.overlay.style.alignItems = 'center';
    // this.overlay.style.justifyContent = 'center';
    // this.overlay.style.borderRadius = '3px';
    this.overlayContent = createdEL({
      style: `background-color: rgba(104, 182, 255, 0.9);font-family: "monospace";font-size: 11px; padding: 2px 3px;
      border-radius: 3px;color: white;pointer-events: none;`
    });
    // this.overlayContent = document.createElement('div');
    // this.overlayContent.style.backgroundColor = 'rgba(104, 182, 255, 0.9)';
    // this.overlayContent.style.fontFamily = 'monospace';
    // this.overlayContent.style.fontSize = '11px';
    // this.overlayContent.style.padding = '2px 3px';
    // this.overlayContent.style.borderRadius = '3px';
    // this.overlayContent.style.color = 'white';
    // this.overlayContent.style.pointerEvents = 'none';
    this.overlay.appendChild(this.overlayContent);
  }

  highlight(el: HTMLElement) {
    const rect: DOMRect = el.getBoundingClientRect();
    if (rect) {
      this.showOverlay(rect, this.content);
    }
  }

  unHighlight() {
    if (this.overlay.parentNode) {
      document.body.removeChild(this.overlay);
    }
  }

  showOverlay({ width = 0, height = 0, top = 0, left = 0 }: DOMRect, content: HTMLElement[] = []) {
    this.overlay.style.width = width + 'px';
    this.overlay.style.height = height + 'px';
    this.overlay.style.top = top + 'px';
    this.overlay.style.left = left + 'px';
    this.overlayContent.innerHTML = '';
    content.forEach(child => {
      child.style.pointerEvents = 'auto';
      child.dataset.spanName = 'highlight-add';
      this.overlayContent.appendChild(child);
    });
    document.body.appendChild(this.overlay);
  }
}
