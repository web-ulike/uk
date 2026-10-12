// Liquid 的 product-media-new 仍通过 generateHtmlForVariant() 初始化媒体。
var variantId = '';
let swiperproductNav = null;
let swiperMain = null;

var ProductNewPage = (() => {
  const state = {
    discountCode: '',
    recommendationRequest: null,
    mediaTimer: null,
    paymentTimer: null,
    selectionVersion: 0,
  };
  const shareText = "This is exactly what I've been waiting for—the Ulike Air 10 IPL device gives you long-lasting smooth skin in just 2 weeks. Professional hair removal results at home? Yes, please! Check it out:";
  const shareUrls = {
    facebook: 'https://www.facebook.com/sharer/sharer.php?u={url}&quote={title}',
    twitter: 'https://twitter.com/intent/tweet?url={url}&text={title}',
    pinterest: 'https://pinterest.com/pin/create/button/?url={url}&description={description}',
    email: 'mailto:?subject={title}&body={description}%20{url}',
  };

  function cancelPendingSelection() {
    state.selectionVersion += 1;
    state.recommendationRequest?.abort();
    state.recommendationRequest = null;
    clearTimeout(state.mediaTimer);
    clearTimeout(state.paymentTimer);
  }

  function bindEvents() {
    $(document)
      .off('.productNew')
      .on('variant:changed.productNew', onVariantChanged)
      .on('cart:refresh.productNew', () => autoDiscountCode(state.discountCode))
      .on('click.productNew', '.product-info-new .btn-copy-block', onCopyDiscount)
      .on('click.productNew', '.product-detail-recommend-item', onRecommendationSelected)
      .on('click.productNew', '.product-info-new .product-detail-recommend-item .product-bundle-add', onBundleAdd)
      .on('click.productNew', '.product-sticky-form .combo-box__option-item', onStickyVariantSelected)
      .on('click.productNew', '.main-image-swiper .share-button', onShare)
      .on('click.productNew', '.product-sticky-up', () => scrollToElement())
      .on('click.productNew', '.button-buy-now', onBuyNow);

    $(window).off('scroll.productNew').on('scroll.productNew', updateScrollButton);
    if (isMobile()) {
      $(document)
        .on('click.productNew', '.main-image-swiper .box-share', onNativeShare)
        .on('click.productNew', '.p-collapsible-container .collapsible-header', onAccordionToggle);
    }
    setTimeout(initializeDiscount, 1000);
  }

  function onVariantChanged(event) {
    const variant = event.detail?.variant;
    if (!variant) {
      cancelPendingSelection();
      return;
    }
    $('.main-image-swiper .close-three-btn').click();
    renderVariant(variant.id);
    updateRecommendations(variant);
  }

  function updateRecommendations(variant) {
    const $items = $('.product-new .product-detail-recommend-item');
    if (!$items.length) return;
    const $first = $items.first();
    let hasMatchingItem = false;
    $items.not(':first').each(function () {
      const $item = $(this);
      const matches = String($item.attr('s_vid')) === String(variant.id);
      hasMatchingItem ||= matches;
      $item.toggleClass('hidden-item', !matches);
      $item.closest('.product-recommend-card-wrapper').toggleClass('hidden-item', !matches);
    });
    $first.toggleClass('hidden-item', !hasMatchingItem);
    $first.closest('.product-recommend-card-wrapper').toggleClass('hidden-item', !hasMatchingItem);
    if (!hasMatchingItem) return;
    $items.removeClass('active');
    $first.addClass('active').attr('pid', variant.id);
    if (variant.featured_image?.src) {
      $first.find('.product-item__primary-image').attr('src', variant.featured_image.src);
    }
  }

  function onCopyDiscount() {
    const $button = $(this);
    const code = $button.find('.code').text();
    copyTextFallback(code);
    state.discountCode = code;
    autoDiscountCode(code);
    $button.hide().nextAll('.copy-success').addClass('show');
    setTimeout(() => {
      $button.nextAll('.copy-success').removeClass('show');
      $button.show();
    }, 3000);
  }

  async function onRecommendationSelected() {
    const $item = $(this);
    const pid = ($item.attr('pid') || '').trim();
    if (!pid) return;
    $('.product-new .product-detail-recommend-item').removeClass('active');
    $item.addClass('active');
    $(".product-form__buy-buttons [name='product-id']").val($item.attr('product-id'));
    $(".product-form__buy-buttons [name='id']").val(pid);
    state.discountCode = $item.data('code') || '';

    const handle = $item.data('handle');
    if (!handle) {
      state.discountCode = $('.p-box-discount-code').attr('auto-code') || '';
      renderVariant(pid);
      return false;
    }

    cancelPendingSelection();
    updateRecommendationImage($item.data('image'));
    const controller = new AbortController();
    const version = state.selectionVersion;
    state.recommendationRequest = controller;
    const root = window.Shopify?.routes?.root || '/';
    try {
      const response = await fetch(`${root}products/${encodeURIComponent(handle)}?view=metafields-json`, {
        signal: controller.signal,
      });
      if (!response.ok) throw new Error(`Product request failed: ${response.status}`);
      const data = await response.json();
      if (version !== state.selectionVersion) return;
      const variants = data.variants || [];
      const requestedId = $item.attr('add-vid');
      const variant = variants.find((item) => requestedId &&
        (String(item.id) === String(requestedId) || String(item.variant_id) === String(requestedId))) || variants[0];
      if (!variant) return;
      const custom = variant.metafields?.custom || {};
      updatePrice(custom, true);
      updateTitle(custom.variant_title || custom.variantTitle || data.title);
      $('.product-info-new .product-subinfo').html(data.description_html || '');
      $('.product-info-new .p-box-price .information').hide();
    } catch (error) {
      if (error.name !== 'AbortError') console.error('Unable to load recommended product', error);
    } finally {
      if (state.recommendationRequest === controller) state.recommendationRequest = null;
    }
  }

  function updateRecommendationImage(image) {
    if (!image) return;
    const largeImage = convertShopifyImageUrl(image, '870x');
    $('.swiper_nav .product__media-image:first').attr('src', convertShopifyImageUrl(image, '80x'));
    const $slide = $('.swiper_main .swiper-slide[data-swiper-slide-index="0"]');
    $slide.find('.product__media-image').attr('src', largeImage);
    $slide.find('a').attr('data-pswp-src', image);
    $slide.find('source').attr('srcset', largeImage);
    swiperMain?.slideToLoop(0);
    swiperproductNav?.slideToLoop(0);
  }

  function onBundleAdd(event) {
    event.preventDefault();
    event.stopPropagation();
    const $button = $(this);
    if ($button.hasClass('is-loading')) return;
    const $item = $button.closest('.product-detail-recommend-item');
    const code = $item.attr('data-code');
    commonGtmEvent(`bundle ${$item.attr('data-event-name')}`, '', 'Product');
    $(".product-form__buy-buttons [name='product-id']").val($item.attr('product-id'));
    $button.addClass('is-loading');
    try {
      addToCart($item.attr('pid'), '', {}, code);
    } catch (error) {
      console.error(error);
      $button.removeClass('is-loading');
      return;
    }
    setTimeout(() => $button.removeClass('is-loading'), 4000);
    if (!code) applyDiscountWithDelay(state.discountCode);
  }

  function applyDiscountWithDelay(code, delay = 1500) {
    setCookie('discount_code', code, 1);
    autoDiscountCode(code);
    setTimeout(() => {
      setCookie('discount_code', code, 1);
      autoDiscountCode(code);
    }, delay);
  }

  function initializeDiscount() {
    const params = new URLSearchParams(window.location.search);
    const addDiscount = params.get('add-discount');
    const discount = params.get('discount');
    if (addDiscount || discount) {
      const code = addDiscount || discount;
      setCookie('discount_code', code, 1);
      setTimeout(() => {
        if (addDiscount) addToCart(variantId);
        autoDiscountCode(code);
      }, addDiscount ? 2000 : 3000);
      return;
    }
    const $discount = $('.p-box-discount-code');
    if ($discount.attr('auto-apply') === 'true') {
      state.discountCode = $discount.attr('auto-code') || '';
      setCookie('discount_code', state.discountCode, 1);
      autoDiscountCode(state.discountCode);
    }
    const $items = $('.product-new .product-detail-recommend-item');
    if ($items.length) {
      $items.first().attr('data-code', state.discountCode);
      if ($('.product-recommend-card-wrapper:not(.hidden-item)').length) {
        $('.product-new .product-recommend-card-wrapper').first().removeClass('hidden-item');
      }
    }
  }

  function onBuyNow() {
    const $button = $(this);
    const originalText = $button.text();
    const pid = $(".product-form__buy-buttons [name='id']").val();
    const code = $('.p-box-discount-code').attr('auto-code');
    $button.text('').attr('aria-busy', 'true');
    try {
      buyProduct(pid, {}, code);
    } finally {
      setTimeout(() => $button.text(originalText).attr('aria-busy', 'false'), 2000);
    }
  }

  function onStickyVariantSelected() {
    const name = $(this).attr('value');
    $(this).attr('aria-selected', true).siblings().attr('aria-selected', false);
    $('.color-swatch').filter(function () {
      return $(this).attr('value') === name;
    }).find('[type="radio"]').click();
  }

  function onShare() {
    const network = $(this).data('network');
    const template = shareUrls[network];
    if (!template) return;
    const url = template.replace('{url}', encodeURIComponent(window.location.href))
      .replace('{title}', '').replace('{description}', encodeURIComponent(shareText));
    if (network === 'email') {
      const link = document.getElementById('hiddenMailtoLink');
      if (!link) return;
      link.href = url;
      link.click();
    } else {
      window.open(url, '_blank');
    }
  }

  function onNativeShare() {
    if (!navigator.share) return;
    navigator.share({ title: '', text: shareText, url: window.location.href })
      .catch((error) => {
        if (error.name !== 'AbortError') console.error('Unable to share product', error);
      });
  }

  function onAccordionToggle() {
    const $content = $(this).next('.collapsible-content');
    const visible = $content.is(':visible');
    $content[visible ? 'slideUp' : 'slideDown'](300);
    $(this).find('.toggle-btn').text(visible ? '+' : '−');
  }

  function updateScrollButton() {
    const selector = isMobile() ? '.p-evaluate-carousel' : '.box-how-to-use';
    const $target = $(selector).first();
    const footerOffset = $('.footer').first().offset();
    const threshold = $target.length ? $target.offset().top : (footerOffset?.top || 400) - 400;
    const show = $(window).scrollTop() > threshold;
    $('.product-sticky-up').stop(true, true)[show ? 'fadeIn' : 'fadeOut']();
  }

  function getPriceAmount(price) {
    const element = document.createElement('div');
    element.innerHTML = price || '';
    return element.textContent.replace(/[£$]/g, '');
  }

  // 主产品与推荐商品沿用原有货币展示、分期组件的参数约定。
  function updatePrice(variant, isRecommendation = false) {
    const price = variant.price || '';
    const originalPrice = variant.original_price || '';
    const hasDiscountPrice = price !== '' && variant.page_price != null && variant.page_price !== '';
    const isOriginalPrice = variant.isOriginalPrice === 'true' || variant.isOriginalPrice === true;
    const prefix = isRecommendation ? 'US' : '';
    let displayPrice = price;
    let comparePrice = '';
    let paymentAmount = getPriceAmount(price);

    if (isOriginalPrice) {
      comparePrice = isRecommendation && price === originalPrice ? '' : originalPrice;
      paymentAmount = isRecommendation ? getPriceAmount(price) : price;
    } else if (hasDiscountPrice) {
      displayPrice = formatMoney(variant.page_price);
      comparePrice = prefix + price;
      paymentAmount = variant.page_price;
    }
    $('.p-box-price .price').html(price ? prefix + displayPrice : '');
    $('.p-box-price .original_price').html(comparePrice);
    $('.pay-button').attr('data-pp-amount', paymentAmount);
    if (isRecommendation) {
      $('.affirm-as-low-as').attr('data-amount', paymentAmount);
      if (isOriginalPrice) $('klarna-placement').attr('data-purchase-amount', paymentAmount);
    } else {
      const klarnaAmount = !isOriginalPrice && hasDiscountPrice ? variant.page_price * 100 : getPriceAmount(price);
      $('klarna-placement').attr('data-purchase-amount', klarnaAmount);
      clearTimeout(state.paymentTimer);
      if (!isOriginalPrice && hasDiscountPrice) {
        state.paymentTimer = setTimeout(() => $('klarna-placement').attr('data-purchase-amount', klarnaAmount), 2000);
      }
    }
  }

  function updateTitle(title) {
    if (title) $('.product-info-new .product-meta__title').html(title);
  }

  function updateAddToCartText(variant) {
    $('.product-form .btn-add-to-cart').each(function () {
      const $button = $(this);
      const $text = $button.find('span').first();
      const parts = ($button.attr('data-button-content') || $text.text()).split('-');
      if (parts.length > 1 && $button.data('add-text') == 2) {
        $text.html(parts[0] + '-' + formatMoney(variant.page_price));
      }
    });
  }

  function resolveVariant(id) {
    const variants = typeof variantArr === 'undefined' ? [] : variantArr;
    const selectedId = id || getUrlParameter('variant');
    return variants.find((variant) => String(variant.vid) === String(selectedId)) || variants[0];
  }

  function buildMediaSlides(variant) {
    const media = typeof productMediaArr === 'undefined' ? [] : productMediaArr;
    const main = [];
    const thumbnails = [];
    const start = Math.max(0, (Number(variant.position) || 1) - 1);
    const end = Math.min(Number(variant.max) || media.length, media.length);
    for (let index = start; index < end; index += 1) {
      const item = media[index];
      if (!item) continue;
      const alt = escapeProductAttribute(item.alt || 'Ulike Product Image');
      const loading = index === start ? 'fetchpriority="high"' : 'loading="lazy"';
      const image = item.media_type === 'video' ? item.preview_image?.src : item.src;
      const src = escapeProductAttribute(image || '');
      const content = item.media_type === 'video' ? generateVideoHtml(item.sources || []) : `
        <a data-id="${index}" data-pswp-src="${src}" rel="nofollow" data-pswp-width="${item.width}" data-pswp-height="${item.height}" alt="${alt}">
          <picture>
            <source media="(max-width: 768px)" srcset="${escapeProductAttribute(convertShopifyImageUrl(image, '870x') || '')}">
            <img class="product__media-image" ${loading} src="${escapeProductAttribute(convertShopifyImageUrl(image, '870x') || '')}" alt="${alt}" media_type="${escapeProductAttribute(item.media_type)}">
          </picture>
        </a>`;
      main.push(`<div class="swiper-slide">${content}</div>`);
      thumbnails.push(`<div class="swiper-slide"><div class="responsive-clip-path">
        <img class="product__media-image" width="68px" height="63px" ${loading} src="${escapeProductAttribute(convertShopifyImageUrl(image, '80x') || '')}" alt="${alt}" media_type="${escapeProductAttribute(item.media_type)}">
      </div></div>`);
    }
    return { main: main.join(''), thumbnails: thumbnails.join('') };
  }

  function renderVariant(id) {
    cancelPendingSelection();
    const variant = resolveVariant(id);
    if (!variant) return;
    variantId = variant.vid;
    const slides = buildMediaSlides(variant);
    state.mediaTimer = setTimeout(() => {
      $('.swiper_main .swiper-wrapper').html(slides.main);
      $('.swiper_nav .swiper-wrapper').html(slides.thumbnails);
      initImages();
      $('.product-slider-btn-model').attr('attr-model-url', variant.url || '').toggle(Boolean(variant.url));
      updatePrice(variant);
      updateTitle(variant.variantTitle || variant.title);
      updateAddToCartText(variant);
      document.querySelectorAll('ulike-variant-discounts').forEach((element) => {
        if (element.querySelector(`template[data-variant-discounts="${variant.vid}"]`)) element.updateDiscounts(variant.vid);
      });
    }, 10);
  }

  function initImages() {
    if (typeof Swiper === 'undefined' || !document.querySelector('.product-media-new .swiper_main')) return;
    swiperMain?.destroy(true, true);
    swiperproductNav?.destroy(true, true);
    swiperproductNav = new Swiper('.product-media-new .swiper_nav', {
      slidesPerView: 'auto', spaceBetween: 10, freeMode: true,
      simulateTouch: true, mousewheel: true,
      watchSlidesVisibility: true, watchSlidesProgress: true,
      breakpoints: { 640: { direction: 'horizontal' }, 1024: { direction: 'vertical' } },
    });
    swiperMain = new Swiper('.product-media-new .swiper_main', {
      spaceBetween: 0, lazy: { loadPrevNext: true }, loop: true,
      pagination: { el: '.swiper-pagination', clickable: true },
      navigation: { nextEl: '.swiper_main .swiper-button-next', prevEl: '.swiper_main .swiper-button-prev' },
      thumbs: { swiper: swiperproductNav },
    });
  }

  $(bindEvents);
  return { renderVariant, initImages };
})();

// 保留现有模板与脚本使用的入口。
function generateHtmlForVariant(id) {
  ProductNewPage.renderVariant(id);
}

function initProductImages() {
  ProductNewPage.initImages();
}

function getUrlParameter(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function escapeProductAttribute(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function convertShopifyImageUrl(url, size) {
  // 将尺寸放在扩展名前，保留 Shopify 的版本查询参数。
  return typeof url === 'string' ? url.replace(/(\.[^/.?#]+)(?=[?#]|$)/, `_${size}$1`) : url;
}

function generateVideoHtml(sources) {
  const videos = Object.values(filterAndFindMaxWidth(sources));
  const html = videos.map((video) => `<source src="${escapeProductAttribute(video.url)}" type="${escapeProductAttribute(video.mime_type)}">`).join('');
  return `<video autoplay muted loop playsinline controls>${html}Your browser does not support the video tag.</video>`;
}

function filterAndFindMaxWidth(sources) {
  return sources.reduce((result, source) => {
    if (!result[source.mime_type] || source.width > result[source.mime_type].width) {
      result[source.mime_type] = source;
    }
    return result;
  }, {});
}

function formatMoney(cents, format = "") {
  if (typeof cents === "string") {
    cents = cents.replace(".", "");
  }
  const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/, formatString = format || window.themeVariables.settings.moneyFormat;
  function defaultTo(value2, defaultValue) {
    return value2 == null || value2 !== value2 ? defaultValue : value2;
  }
  function formatWithDelimiters(number, precision, thousands, decimal) {
    precision = defaultTo(precision, 2);
    thousands = defaultTo(thousands, ",");
    decimal = defaultTo(decimal, ".");
    if (isNaN(number) || number == null) {
      return 0;
    }
    number = (number / 100).toFixed(precision);
    let parts = number.split("."), dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + thousands), centsAmount = parts[1] ? decimal + parts[1] : "";
    return dollarsAmount + centsAmount;
  }
  let value = "";
  switch (formatString.match(placeholderRegex)[1]) {
    case "amount":
      value = formatWithDelimiters(cents, 2);
      break;
    case "amount_no_decimals":
      value = formatWithDelimiters(cents, 0);
      break;
    case "amount_with_space_separator":
      value = formatWithDelimiters(cents, 2, " ", ".");
      break;
    case "amount_with_comma_separator":
      value = formatWithDelimiters(cents, 2, ".", ",");
      break;
    case "amount_with_apostrophe_separator":
      value = formatWithDelimiters(cents, 2, "'", ".");
      break;
    case "amount_no_decimals_with_comma_separator":
      value = formatWithDelimiters(cents, 0, ".", ",");
      break;
    case "amount_no_decimals_with_space_separator":
      value = formatWithDelimiters(cents, 0, " ");
      break;
    case "amount_no_decimals_with_apostrophe_separator":
      value = formatWithDelimiters(cents, 0, "'");
      break;
  }
  return formatString.replace(placeholderRegex, value);
}
// Luke 产品页：变体折扣提示和折扣值，空值回退到组件配置。
if (!customElements.get('ulike-variant-discounts')) {
  customElements.define('ulike-variant-discounts', class extends HTMLElement {
    connectedCallback() {
      this.onVariantChanged = (event) => {
        if (event.target.id === this.getAttribute('form-id')) {
          this.updateDiscounts(event.detail?.variant?.id);
        }
      };
      this.addEventListener('variant:changed', this.onVariantChanged);
    }

    updateDiscounts(variantId) {
      const template = Array.from(this.querySelectorAll('template[data-variant-discounts]'))
        .find((item) => item.dataset.variantDiscounts === String(variantId));
      const information = template?.content.querySelector('[data-discount-information]')?.innerHTML || '';
      const discountText = template?.content.querySelector('[data-discount-text]')?.textContent || '';
      this.querySelectorAll('[data-variant-discount-information]').forEach((element) => {
        const value = information.trim() ? information : element.dataset.default || '';
        element.innerHTML = value;
        element.style.display = value.trim() ? '' : 'none';
      });
      this.querySelectorAll('[data-variant-discount-text]').forEach((element) => {
        element.textContent = discountText.trim() ? discountText : element.dataset.default || '';
      });
    }

    disconnectedCallback() {
      this.removeEventListener('variant:changed', this.onVariantChanged);
    }
  });
}
