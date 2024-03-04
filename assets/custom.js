window.theme = window.theme || {};

theme.config = {
  mqlSmall: false,
  mediaQuerySmall: 'screen and (max-width: 749px)',
  isTouch: ('ontouchstart' in window) || window.DocumentTouch && window.document instanceof DocumentTouch || window.navigator.maxTouchPoints || window.navigator.msMaxTouchPoints ? true : false,
};

// Init section function when it's visible, then disable observer
theme.initWhenVisible = function(options) {
  const threshold = options.threshold ? options.threshold : 0;

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (typeof options.callback === 'function') {
          options.callback();
          observer.unobserve(entry.target);
        }
      }
    });
  }, {rootMargin: `0px 0px ${threshold}px 0px`});

  observer.observe(options.element);
};

class ImageComparison extends HTMLElement {
  constructor() {
    super();

    this.active = false;
    this.button = this.querySelector('button');
    this.horizontal = this.dataset.layout === 'horizontal';
    this.init();

    theme.initWhenVisible({
      element: this.querySelector('.image-comparison__animate'),
      callback: this.animate.bind(this),
      threshold: 0
    });

  }

  animate() {
    this.setAttribute('animate', '');
    this.classList.add('animating');
    setTimeout(() => {
      this.classList.remove('animating');
    }, 1e3);
  }

  init() {
    if (theme.config.isTouch) {
      this.button.addEventListener('touchstart', this.startHandler.bind(this));
      document.body.addEventListener('touchend', this.endHandler.bind(this));
      document.body.addEventListener('touchmove', this.onHandler.bind(this));
    }
    else {
      this.button.addEventListener('mousedown', this.startHandler.bind(this));
      document.body.addEventListener('mouseup', this.endHandler.bind(this));
      document.body.addEventListener('mousemove', this.onHandler.bind(this));
    }
  }

  startHandler() {
    this.active = true;
    this.classList.add('scrolling');
  }

  endHandler() {
    this.active = false;
    this.classList.remove('scrolling');
  }

  onHandler(e) {
    if (!this.active) return;

    const event = (e.touches && e.touches[0]) || e;
    const x = this.horizontal
                ? event.pageX - this.offsetLeft
                : event.pageY - this.offsetTop;

    this.scrollIt(x);
  }

  scrollIt(x) {
    const distance = this.horizontal ? this.clientWidth : this.clientHeight;

    const max = distance - 20;
    const min = 20;
    const mouseX = Math.max(min, (Math.min(x, max)));
    const mousePercent = (mouseX * 100) / distance;
    this.style.setProperty('--percent', mousePercent + '%');
  }
}
customElements.define('image-comparison', ImageComparison);


// 用户自定义js公共库
function isMobile() {
  return (/Android|iPhone|iPad|iPod|BlackBerry/i).test(navigator.userAgent || navigator.vendor || window.opera);
}

/**
  * 防抖
  */
function debounce(func, delay) {
  let timer;

  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}



/**
 * GTM 增加GA事件
 * @param {*} category 
 * @param {*} operating 
 * @param {*} label 
 */
function commonGtmEvent(category, operating, label) {
  if(isMobile()){
    category = `M${category}`
  }
  dataLayer.push({ event: 'common', category, operating, label });
}

/**
 * 获取cookie
 * @param {名称} name 
 * @returns 
 */
function getCookie(name) {
  const cookieName = name + '=';
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    if (cookie.indexOf(cookieName) === 0) {
      return cookie.substring(cookieName.length, cookie.length);
    }
  }
  return '';
}

/**
 * 初始化事件
 */
function init(){
  if(location.pathname.includes('/pages/meta-air-3-product-detail') || location.pathname.includes('/pages/meta-air-plus-product-detail')){
    $('#cart_count_down_mini-cart').hide();
    setTimeout(function(){
      $('#cart_count_down_mini-cart').hide();
    }, 5000)
  }
}

document.addEventListener("DOMContentLoaded", function() {
  init();
  initGA();
})


/**
 * 公共 GA代码添加方法
 */
function initGA() {

  // logo
  $(document).on("click", ".header__logo-link", function () {
    commonGtmEvent('导航-logo', 'click', 'logo');
  });

  $(document).on("click", ".header__linklist .header__linklist-link", function () {
    let _title = $(this).text();
    commonGtmEvent(`导航-${_title}`, 'click', 'logo');
  });

  // $(document).on("click", ".popu_subscripte", function () {
  //   commonGtmEvent('导航-exclusive', 'click', '');
  // });

  $(document).on("click", ".j-search", function () {
    commonGtmEvent('导航-search', 'click', '');
  });
  $(document).on("click", ".j-customer", function () {
    commonGtmEvent('导航-login', 'click', '');
  });
  $(document).on("click", ".j-cart", function () {
    commonGtmEvent('导航-add cart', 'click', '');
  });

  // banner
  $(document).on("click", ".slideshow__slide-list .home-btn", function () {
    var i = 1,
      index = 1;
    $('.slideshow__progress-bar').each(function () {
      if ($(this).attr('aria-current') == 'true') {
        index = i;
        return
      }
      i++
    })
    commonGtmEvent(`首页-banner${index}`, 'click', '');
  });

  $(document).on("click", ".product-list .product-list-container:nth-child(1) .product-list-link", function () {
    commonGtmEvent('首页-air3-shop now', 'click', '');
  });

  $(document).on("click", ".product-list .product-list-container:nth-child(1) .product-list-link", function () {
    commonGtmEvent('首页-air+ shop now', 'click', '');
  });

  // $(document).on("click", ".media-evaluation-real-box .media-real-bottom-arrow-item", function () {
  //   commonGtmEvent('首页-review swith', 'click', '');
  // });
  // $(document).on("click", ".sub-activity-left .sub-activity-btn", function () {
  //   commonGtmEvent('首页- marketing banner1', 'click', '');
  // });
  // $(document).on("click", ".sub-activity-right .sub-activity-btn:eq(0)", function () {
  //   commonGtmEvent('首页- marketing banner2', 'click', '');
  // });
  // $(document).on("click", ".sub-activity-right .sub-activity-btn:eq(1)", function () {
  //   commonGtmEvent('首页- marketing banner3', 'click', '');
  // });
  // blog

  $(document).on("click", ".blog-info-cont .blog-info-left", function () {
    commonGtmEvent('首页-blog1', 'click', '');
  });
  $(document).on("click", ".blog-info-list .blog-info-item", function () {
    var index = $(".blog-info-list .blog-info-item").index($(this)) + 2;
    commonGtmEvent(`首页-blog${index}`, 'click', '');
  });
  // 订阅
  $(document).on("click", "#shopify-section-footer .btn-ico", function () {
    commonGtmEvent('首页-bottom subscription', 'click', '');
  });

  $(document).on("click", ".footer__item--social-media .social-media__item", function () {
    console.log($(this).index());
    let index = $(this).index();
    let name = '首页-fb';
    switch (index) {
      case 0:
        name = '首页-fb';
        break;
      case 1:
        name = '首页-ins';
        break;
      case 2:
        name = '首页-youtube';
        break;
      case 3:
        name = '首页-tt';
        break;
    }
    commonGtmEvent(name, 'click', '');
  });

  $(document).on("click", ".footer__item-list .link--faded", function () {
    let _title = $(this).text();
    commonGtmEvent(`首页-bottom ${_title}`, 'click', '');
  });
  // 优惠劵应用成功触发
  // document.body.addEventListener('docapp-discount-success', (e) => {
  //   commonGtmEvent(`结账-apply`, `code:${e.code}`, location.pathname);
  // });

  $(document).on("click", ".checkout-button", function () {
    commonGtmEvent(`结账-check out`, 'click', location.pathname);
    commonGtmEvent(`checkout`, 'checkouts', location.pathname);
  });

  $(document).on("click", ".lucky-coupon-trigger-simple.active", function () {
    commonGtmEvent(`首页- win free`, 'click', location.pathname);
  });
  $(document).on("click", "#lc31148 > div.close-wheel", function () {
    commonGtmEvent(`首页- win close`, 'click', location.pathname);
  });
  $(document).on("click", "#launch-spinthewheel", function () {
    commonGtmEvent(`首页-win spin`, 'click', location.pathname);
  });

}