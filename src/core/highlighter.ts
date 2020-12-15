import { createdEL } from '../share/index';

export default class Highlighter {
  private readonly overlay: HTMLElement;
  private readonly overlayContent: HTMLElement;
  private readonly content: HTMLElement[];

  constructor(content: HTMLElement[]) {
    this.content = content;
    this.overlay = createdEL({
      style: `background-color:rgba(104, 182, 255, 0.35);position: fixed;z-index:9999999;
      pointer-events: none;display:flex;align-items: center;justify-content: center;
      border-radius: 3px`,
    });
    this.overlayContent = createdEL({
      style: `background-color: rgba(104, 182, 255, 0.9);font-family: "monospace";font-size: 11px; padding: 2px 3px;
      border-radius: 3px;color: white;pointer-events: none;`,
    });
    this.overlay.appendChild(this.overlayContent);
  }

  public highlight(el: HTMLElement, noContent: boolean = false) {
    const rect: DOMRect = el.getBoundingClientRect();
    if (rect) {
      if (noContent) {
        this.overlayContent.style.display = 'none';
      } else {
        this.overlayContent.style.display = 'block';
      }
      this._showOverlay(rect, this.content);
    }
  }

  public unHighlight() {
    if (this.overlay.parentNode) {
      document.body.removeChild(this.overlay);
    }
  }

  private _showOverlay({ width = 0, height = 0, top = 0, left = 0 }: DOMRect, content: HTMLElement[] = []) {
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
