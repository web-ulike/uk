if (!customElements.get('luke-variant-discounts')) {
  customElements.define('luke-variant-discounts', class extends HTMLElement {
    connectedCallback() {
      this.onVariantChanged = (event) => {
        if (event.target.id !== this.getAttribute('form-id')) return;

        const variantId = event.detail.variant?.id;
        const template = Array.from(this.querySelectorAll('template[data-variant-discounts]'))
          .find((item) => item.dataset.variantDiscounts === String(variantId));
        const information = template?.content.querySelector('[data-discount-information]').innerHTML || '';
        const discountText = template?.content.querySelector('[data-discount-text]').textContent || '';

        this.querySelectorAll('[data-variant-discount-information]').forEach((element) => {
          const value = information.trim() ? information : element.dataset.default || '';
          element.innerHTML = value;
          element.style.display = value.trim() ? '' : 'none';
        });

        this.querySelectorAll('[data-variant-discount-text]').forEach((element) => {
          element.textContent = discountText.trim() ? discountText : element.dataset.default || '';
        });
      };
      this.addEventListener('variant:changed', this.onVariantChanged);
    }

    disconnectedCallback() {
      this.removeEventListener('variant:changed', this.onVariantChanged);
    }
  });
}
