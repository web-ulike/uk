window.theme = window.theme || {};

theme.config = {
  mqlSmall: false,
  mediaQuerySmall: 'screen and (max-width: 749px)',
  isTouch:
    'ontouchstart' in window ||
      (window.DocumentTouch && window.document instanceof DocumentTouch) ||
      window.navigator.maxTouchPoints ||
      window.navigator.msMaxTouchPoints
      ? true
      : false,
};

// Init section function when it's visible, then disable observer
theme.initWhenVisible = function (options) {
  const threshold = options.threshold ? options.threshold : 0;

  const observer = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (typeof options.callback === 'function') {
            options.callback();
            observer.unobserve(entry.target);
          }
        }
      });
    },
    { rootMargin: `0px 0px ${threshold}px 0px` }
  );

  observer.observe(options.element);
};

class ImageComparison extends HTMLElement {
  constructor() {
    super();
    console.log(' this.button-----', this);
    this.active = false;
    this.button = this.querySelector('button');
    this.horizontal = this.dataset.layout === 'horizontal';
    this.init();
    theme.initWhenVisible({
      element: this.querySelector('.image-comparison__animate'),
      callback: this.animate.bind(this),
      threshold: 0,
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
    } else {
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
    const mouseX = Math.max(min, Math.min(x, max));
    const mousePercent = (mouseX * 100) / distance;
    this.style.setProperty('--percent', mousePercent + '%');
  }
}
customElements.define('image-comparison', ImageComparison);

// 用户自定义js公共库
function isMobile() {
  if (window.innerWidth < 768) {
    return true;
  }
  return /Android|iPhone|iPad|iPod|BlackBerry/i.test(
    navigator.userAgent || navigator.vendor || window.opera
  );
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
  if (operating == 'true' && isMobile()) {
    category = `M-${category}`
  }
  gtag('event', category, {
    operating: operating,
    label: label
  });
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
 * 设置cookie
 * @param {string} cookieName - cookie的名称
 * @param {string} cookieValue - cookie的值
 * @param {number} daysToExpire - cookie的过期天数，默认为0，表示永不过期
 */
function setCookie(cookieName, cookieValue, daysToExpire, endOfDay = false) {
  var expires = '';
  if (daysToExpire) {
    var date = new Date();
    date.setTime(date.getTime() + daysToExpire * 24 * 60 * 60 * 1000);
    if (endOfDay) {
      date.setHours(00, 00, 00, 000); // 设置为那天的第一秒
    }
    expires = '; expires=' + date.toUTCString();
  }
  document.cookie = cookieName + '=' + cookieValue + expires + '; path=/';
}

var lcpValue = 0; // 用于存储 LCP 的值
// seo 优化
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

/**
 * 初始化事件
 */
function init() {
  // seo 解决图片
  // 获取所有 <video> 标签中的 <img> 标签
  const videoImages = document.querySelectorAll('video img');
  // 遍历所有的 <img> 标签，并设置 alt 属性
  videoImages.forEach((img) => {
    img.setAttribute('alt', 'video image');
    img.setAttribute('loading', 'lazy');
  });

  // 处理全局折扣码
  let gDiscount = getUrlParameter('discount');
  if (gDiscount) {
    setCookie('discount_code', gDiscount, 1);
    setTimeout(function () {
      var codeArr = window.discountOnCartProApp.codes;
      if (codeArr.length > 0) {
        window.discountOnCartProApp.removeCode(codeArr[0]);
      }
      autoDiscountCode(gDiscount);
    }, 4000);
  }

}

document.addEventListener('DOMContentLoaded', function () {
  init();
  setTimeout(initGA, 1000);
  window.quickChatReadyHook = () => {
    console.log('访客端初始化完成=-------')
  }

});

/**
 * 公共 GA代码添加方法
 */
function initGA() {
  // logo
  $(document).on('click', '.header__logo-link', function () {
    commonGtmEvent('导航-Ulike', 'click', 'logo');
  });

  // $(document).on(
  //   'click',
  //   '.header__linklist .header__linklist-link',
  //   function () {
  //     let _title = $(this).text();
  //     commonGtmEvent(`导航-${_title}`, 'click', 'logo');
  //   }
  // );

  // 老版本导航埋点

  // $(document).on('click', '.header .j-search', function () {
  //   commonGtmEvent('导航-search', 'click', '');
  // });
  // $(document).on('click', '.header .j-customer', function () {
  //   commonGtmEvent('导航-login', 'click', '');
  // });
  // $(document).on('click', '.header .j-cart', function () {
  //   commonGtmEvent('导航- cart', 'click', '');
  // });

  // 移动端老导航
  // $(document).on('click', '.mobile-product-box .mobile-product-item', function () {
  //   const index = $(this).index();
  //   console.log('index', index);
  //   switch (index) {
  //     case 0:
  //       commonGtmEvent('导航-air10', 'click', `index-${index}`);
  //       break;
  //     case 1:
  //       commonGtmEvent('导航-air3', 'click', `index-${index}`);
  //       break;
  //     case 2:
  //       commonGtmEvent('导航-air2', 'click', `index-${index}`);
  //   }
  // });

  // $(document).on('click', '#mobile-menu-drawer .header-img-link', function () {
  //   commonGtmEvent('导航-sale', 'click', '');
  // });

  // if (isMobile()) {
  //   // 移动端点击第一个 icon
  //   $(document).on('click', '.header .header__icon-wrapper:first', function () {
  //     console.log('导航-expand');
  //     commonGtmEvent('导航-expand', 'click', '');
  //   });
  //   // $('#mobile-menu-drawer .mobile-nav__item')
  //   $(document).on(
  //     'click',
  //     '#mobile-menu-drawer .mobile-nav__item',
  //     function () {
  //       let _title = $(this).text();
  //       commonGtmEvent(`导航-${_title}`, 'click', '');
  //     }
  //   );
  // }

    // 新导航添加事件
  $(document).on('click', '#desktop-menu-1 .header-new-operate-btn, #mobile-menu-1 .header-new-operate-btn', function () {
    commonGtmEvent('导航-Sale', 'true', location.pathname);
  });

  $(document).on('click', '#desktop-menu-2 .header-new-product-item, #mobile-menu-2  .header-new-product-item', function () {
    let index = $('#desktop-menu-2 .header-new-product-item').index(this);
    if (isMobile()) {
     index = $('#mobile-menu-2 .header-new-product-item').index(this);
    }
    switch(index){
      case 0:
        commonGtmEvent('导航-air10', 'true', location.pathname);
        break;
      case 1:
        commonGtmEvent('导航-air3', 'true', location.pathname);
        break;
      case 2:
        commonGtmEvent('导航-air2', 'true', location.pathname);
        break;
      // case 3:
      //   commonGtmEvent('导航-reglow', 'true', location.pathname);
      //   break;
    }
  });

  $(document).on('click', '#desktop-menu-4 .header-new-link-item, #mobile-menu-4 .header-new-link-item', function (e) {
    const linkText = $(this).attr('text').trim();
    commonGtmEvent('导航-explore more-' + linkText, 'true', location.pathname);
  });

  $(document).on('click', '.header .header__linklist-link, #mobile-menu-drawer .mobile-nav .mobile-nav__link', function () {
    const index = $(this).parent().index();
    const mIndex = $('#mobile-menu-drawer .mobile-nav .mobile-nav__link').index(this);
    const linkText = $(this).attr('text');
    if (!linkText){
      return false;
    }

    if (!isMobile() && index != 0){
      commonGtmEvent('导航-'+ linkText, 'true', location.pathname);
    } else if(mIndex != 0) {
      commonGtmEvent('导航-'+ linkText, 'true', location.pathname);
    }

  });

  $(document).on('click', '#desktop-menu-5 .header-new-link-item,#mobile-menu-5 .header-new-link-item', function (e) {
    const linkText = $(this).attr('text').trim();
    commonGtmEvent('导航-Explore More-' + linkText, 'true', location.pathname);
  });

  $(document).on('click', '.header .popover-button', function (e) {
    commonGtmEvent('导航-english', 'true', location.pathname);
  });
  
  // 搜索
  $(document).on('click', '.header .j-search', function () {
    commonGtmEvent('导航-search', 'true', 'search');
  });
  $(document).on('click', '.header .j-cart', function () {
    commonGtmEvent('导航-add cart', 'true', 'cart');
  });
  // 登录
  $(document).on('click', '.header .j-user-login', function () {
    commonGtmEvent('导航-login', 'true', 'wishlist');
  });


  // banner
  $(document).on('click', '.slideshow__slide-list .home-btn', function () {
    var i = 1,
      index = 1;
    $('.slideshow__progress-bar').each(function () {
      if ($(this).attr('aria-current') == 'true') {
        index = i;
        return;
      }
      i++;
    });
    commonGtmEvent(`首页-banner${index}`, 'click', '');
  });

  $(document).on(
    'click',
    '.product-list .product-list-container:nth-child(1) .product-list-link',
    function () {
      commonGtmEvent('首页-air3-shop now', 'click', '');
    }
  );

  $(document).on(
    'click',
    '.product-list .product-list-container:nth-child(1) .product-list-link',
    function () {
      commonGtmEvent('首页-air+ shop now', 'click', '');
    }
  );

  $(document).on('click', '.blog-info-cont .blog-info-left', function () {
    commonGtmEvent('首页-blog1', 'click', '');
  });
  $(document).on('click', '.blog-info-list .blog-info-item', function () {
    var index = $('.blog-info-list .blog-info-item').index($(this)) + 2;
    commonGtmEvent(`首页-blog${index}`, 'click', '');
  });
  // 订阅
  $(document).on('click', '#shopify-section-footer .btn-ico', function () {
    commonGtmEvent('首页-bottom subscription', 'click', '');
  });

  $(document).on(
    'click',
    '.footer__item--social-media .social-media__item',
    function () {
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
    }
  );

  $(document).on('click', '.footer__item-list .link--faded', function () {
    let _title = $(this).text();
    commonGtmEvent(`首页-bottom ${_title}`, 'click', '');
  });
  // 优惠劵应用成功触发
  // document.body.addEventListener('docapp-discount-success', (e) => {
  //   commonGtmEvent(`结账-apply`, `code:${e.code}`, location.pathname);
  // });

  $(document).on('click', '.checkout-button', function () {
    commonGtmEvent(`结账-check out`, 'click', location.pathname);
    commonGtmEvent(`checkout`, 'checkouts', location.pathname);
  });

  $(document).on('click', '.lucky-coupon-trigger-simple.active', function () {
    commonGtmEvent(`首页- win free`, 'click', location.pathname);
  });
  $(document).on('click', '#lc31148 > div.close-wheel', function () {
    commonGtmEvent(`首页- win close`, 'click', location.pathname);
  });
  $(document).on('click', '#launch-spinthewheel', function () {
    commonGtmEvent(`首页-win spin`, 'click', location.pathname);
  });
  $(document).on('click', '#launch-spinthewheel', function () {
    commonGtmEvent(`首页-win spin`, 'click', location.pathname);
  });

  $(document).on(
    'click',
    '.preheat-banner-form-cont .preheat-banner-form-btn',
    function () {
      if ($('.preheat-banner-form-input input').val()) {
        commonGtmEvent(`air10-subscribe`, 'click', location.pathname);
        fbq('track', 'Lead');
      }
    }
  );

  document.body.addEventListener('docapp-discount-code-remove', (e) => {
    setTimeout(function () {
      document.documentElement.dispatchEvent(
        new CustomEvent('cart:refresh', {
          bubbles: false,
        })
      );
    }, 2400);
  });
}

/**
 * 分期按钮
 * @param {*} pid
 */
function JumpCheckout(productId) {
  fetch('/cart/clear.js', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(() => {
      // 购物车已清空，跳转到结账页面
      fetch('/cart/add.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: productId,
          quantity: 1, // 可根据需求设置购买数量
          properties: { '_spp2-deposit': 1 },
          selling_plan: 5258838303,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          fetch('/checkout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              productId: productId,
              properties: { '_spp2-deposit': 1 },
              selling_plan: 5258838303,
              quantity: 1,
              form_type: 'product',
              utf8: '✓',
            }),
          })
            .then((response) => {
              console.log('response', response);
              if (response.status === 302) {
                // 获取重定向的 URL
                const redirectUrl = response.headers.get('Location');
                // 执行重定向
                window.location.href = redirectUrl;
              } else {
                // 处理其他状态码的逻辑
                return response;
              }
            })
            .then((data) => {
              // 处理购买成功后的逻辑
              console.log('Purchase successful:', data);
              // 执行跳转
              window.location.href = data.url;
              // 可以根据需求执行其他操作，例如显示购买成功提示、跳转到订单页面等
            })
            .catch((error) => {
              // 处理购买失败的逻辑
              console.error('Purchase failed:', error);
              // 可以根据需求执行其他错误处理操作
            });
        })
        .catch((error) => {
          // 添加购物车失败，处理错误
          console.error('Error clearing cart:', error);
        });
    })
    .catch((error) => {
      // 清空购物车失败，处理错误
      console.error('Error clearing cart:', error);
    });
}

/**
 * 从URL中获取指定参数的值
 * @param {string} paramName 需要获取的参数名
 * @return {string|null} 如果找到指定参数，则返回其值；否则，返回null
 */
function getUrlParameter(paramName) {
  // 创建一个URLSearchParams对象，用于解析URL中的查询参数
  const params = new URLSearchParams(window.location.search);
  // 使用指定的参数名获取参数值并返回
  return params.get(paramName);
}

/**
 * 自动应用折扣码函数
 * 该函数用于检查当前购物车中已应用的折扣码，如果存在与预设折扣码相似的代码，则移除该代码并应用新的折扣码。
 * @param {string} code - 需要应用的新折扣码
 */
function autoDiscountCode(code) {
  checkObject(window.discountOnCartProApp, function () {
    // let cartCodeArr = window.discountOnCartProApp.codes;
    window.discountOnCartProApp.applyCode(code);
    setTimeout(function () {
      window.discountOnCartProApp.updateWidgets();
    }, 3000);
  });
}

function checkObject(obj, callback) {
  if (window.discountOnCartProApp) {
    // 对象存在，执行回调函数
    callback();
  } else {
    // 对象不存在，1秒后再次检查
    setTimeout(() => checkObject(window.discountOnCartProApp, callback), 1000);
  }
}

// 复制code
function copyTextFallback(text) {
  if (navigator.clipboard) {
    // 确保运行在安全上下文（如 HTTPS）下才能使用 Clipboard API
    navigator.clipboard.writeText(text);
  } else {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed'; // 使文本框不可见
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('复制失败:', err);
    }
    document.body.removeChild(textArea); // 删除临时文本框
  }
}

function scrollToElement(targetId) {
  var targetElement = $('#' + targetId);

  if (targetElement.length) {
    // 滚动到目标元素
    $('html, body').animate(
      {
        scrollTop: targetElement.offset().top - 300,
      },
      1000
    );
  } else {
    // 如果目标元素不存在，滚动到页面顶部
    $('html, body').animate(
      {
        scrollTop: 0,
      },
      1000
    );
  }
}

function formatMoney(cents, format = '') {
  if (typeof cents === 'string') {
    cents = cents.replace('.', '');
  }
  const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/,
    formatString = format || window.themeVariables.settings.moneyFormat;
  function defaultTo(value2, defaultValue) {
    return value2 == null || value2 !== value2 ? defaultValue : value2;
  }
  function formatWithDelimiters(number, precision, thousands, decimal) {
    precision = defaultTo(precision, 2);
    thousands = defaultTo(thousands, ',');
    decimal = defaultTo(decimal, '.');
    if (isNaN(number) || number == null) {
      return 0;
    }
    number = (number / 100).toFixed(precision);
    let parts = number.split('.'),
      dollarsAmount = parts[0].replace(
        /(\d)(?=(\d\d\d)+(?!\d))/g,
        '$1' + thousands
      ),
      centsAmount = parts[1] ? decimal + parts[1] : '';
    return dollarsAmount + centsAmount;
  }
  let value = '';
  switch (formatString.match(placeholderRegex)[1]) {
    case 'amount':
      value = formatWithDelimiters(cents, 2);
      break;
    case 'amount_no_decimals':
      value = formatWithDelimiters(cents, 0);
      break;
    case 'amount_with_space_separator':
      value = formatWithDelimiters(cents, 2, ' ', '.');
      break;
    case 'amount_with_comma_separator':
      value = formatWithDelimiters(cents, 2, '.', ',');
      break;
    case 'amount_with_apostrophe_separator':
      value = formatWithDelimiters(cents, 2, "'", '.');
      break;
    case 'amount_no_decimals_with_comma_separator':
      value = formatWithDelimiters(cents, 0, '.', ',');
      break;
    case 'amount_no_decimals_with_space_separator':
      value = formatWithDelimiters(cents, 0, ' ');
      break;
    case 'amount_no_decimals_with_apostrophe_separator':
      value = formatWithDelimiters(cents, 0, "'");
      break;
  }
  if (formatString.indexOf('with_comma_separator') !== -1) {
    return formatString.replace(placeholderRegex, value);
  } else {
    return formatString.replace(placeholderRegex, value);
  }
}

function sendUlikeApi(url, data) {
  data.siteCode = 'UK'; // Ensure the site code is set to 'UK'
  var _url = 'https://api.ulike.com' + url;
  data.language = window.Shopify.locale;

  data.requestId = generateGUID();
  // Set up the AJAX settings
  var settings = {
    url: _url,
    method: 'POST', // POST is used as the request method
    headers: {
      'Content-Type': 'application/json', // Request payload is in JSON format
    },
    data: JSON.stringify(data), // Convert data object to JSON string
    xhrFields: {
      withCredentials: true, // Allow cookies and credentials to be sent
    },
  };

  // Return a new Promise
  return new Promise((resolve, reject) => {
    $.ajax(settings)
      .done(function (response) {
        resolve(response); // Resolve the promise with the response
      })
      .fail(function (error) {
        console.error('Error during API call:', error); // Log the error
        reject(error); // Reject the promise with the error
      });
  });
}

function generateGUID() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }
  return (
    s4() +
    s4() +
    '-' +
    s4() +
    '-' +
    s4() +
    '-' +
    s4() +
    '-' +
    s4() +
    s4() +
    s4()
  );
}

function validateEmail(t) {
  const e = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return e.test(t);
}


function loadCSS(href) {
  let link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  link.media = "all"; // 使其立即生效
  link.fetchPriority = "low"; // 低优先级加载
  document.head.appendChild(link);
}