var variantId = '';
$(function () {
  let disCode = ''; // 优惠券code
  document.addEventListener('variant:changed', function (event) {
    const variant = event.detail.variant; // 假设事件传递了 variant 详细信息
    //  关闭3d模型
    $('.main-image-swiper .close-three-btn').click();
    generateHtmlForVariant(variant.id);
    //更改顶部选择的值
  });

  document.addEventListener('cart:refresh', function (event) {
    autoDiscountCode(disCode);
  });

  // 添加点击事件
  // 折扣码
  $(document).on("click", ".product-info-new .btn-copy-block", function () {
    let ths = $(this);
    let code = ths.find('.code').text();
    copyTextFallback(code);
    disCode = code;
    // 自定应用折扣
    autoDiscountCode(code);
    ths.hide();
    ths.nextAll('.copy-success').addClass('show');
    setTimeout(function () {
      ths.nextAll('.copy-success').removeClass('show');
      ths.show();
    }, 3000);
    // 复制优惠券之后自动添加商品
    // $('#AddToCart').click();

  });

  // 置顶栏 变体选择点击
  $(document).on("click", ".product-sticky-form .combo-box__option-item", function () {
    $(this).attr('aria-selected', true);
    $(this).siblings().attr('aria-selected', false);
    let name = $(this).attr('value');
    $(`.color-swatch[value="${name}"]`).find('[type="radio"]').click()
  })


  // 分享
  const shareUrls = {
    facebook: 'https://www.facebook.com/sharer/sharer.php?u={url}&quote={title}',
    twitter: 'https://twitter.com/intent/tweet?url={url}&text={title}',
    pinterest: 'https://pinterest.com/pin/create/button/?url={url}&description={description}',
    email: 'mailto:?subject={title}&body={description}%20{url}'
  };

  // 绑定点击事件
  $(document).on("click", ".main-image-swiper .share-button", function () {
    const network = $(this).data('network');
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent('');
    const description = encodeURIComponent(`This is exactly what I've been waiting for—the Ulike Air 10 IPL device gives you long-lasting smooth skin in just 2 weeks. Professional hair removal results at home? Yes, please! Check it out:`);

    // 使用模板替换标题和描述
    let shareUrl = shareUrls[network]
      .replace('{url}', url)
      .replace('{title}', title)
      .replace('{description}', description);

    // 如果是邮件分享，直接跳转
    if (network === 'email') {
      // 获取隐藏的 a 标签，并设置 href 属性
      const hiddenLink = document.getElementById('hiddenMailtoLink');
      hiddenLink.href = shareUrl;
      // 触发 a 标签的点击事件
      hiddenLink.click();
    } else {
      // 打开分享窗口
      window.open(shareUrl, '_blank');
    }
  });

  // 移动端增加分享功能
  if (isMobile()) {
    $(document).on("click", ".main-image-swiper .box-share", function () {
      // 移动端自动调用分享功能
      if (navigator.share) {
        navigator.share({
          title: '',
          text: `This is exactly what I've been waiting for—the Ulike Air 10 IPL device gives you long-lasting smooth skin in just 2 weeks. Professional hair removal results at home? Yes, please! Check it out:`,
          url: location.href
        })
          .then(() => console.log('分享成功'))
          .catch((error) => console.log('分享失败', error));
      } else {
        console.log('当前浏览器不支持 Web 分享功能');
      }
    });

    $('.p-collapsible-container .collapsible-header').on('click', function () {
      const $content = $(this).next('.collapsible-content');
      const $toggleBtn = $(this).find('.toggle-btn');

      // Toggle the content display
      if ($content.is(':visible')) {
        $content.slideUp(300); // 使用 slideUp 动画隐藏
        $toggleBtn.text('+');
      } else {
        $content.slideDown(300); // 使用 slideDown 动画显示
        $toggleBtn.text('−');
      }
    });
  }

  // 置顶向上功能
  $(document).on("click", ".product-sticky-up", function () {
    scrollToElement();
  })

  // 滚动到顶部
  $(window).scroll(function () {
    // 如果页面向下滚动超过 200px，则显示置顶图标
    if (isMobile()) {
      let targetOffset = $('.p-evaluate-carousel').length ? $('.p-evaluate-carousel').offset().top : $('.footer').offset().top - 400;
      if ($(this).scrollTop() > targetOffset) {
        $('.product-sticky-up').fadeIn();
      } else {
        $('.product-sticky-up').fadeOut();
      }
    } else {
      let targetOffset = $('.box-how-to-use').length ? $('.box-how-to-use').offset().top : $('.footer').offset().top - 400;
      if ($(this).scrollTop() > targetOffset) {
        $('.product-sticky-up').fadeIn();
        // 显示图标，可以使用fadeIn动画效果
      } else {
        // 否则隐藏置顶图标
        $('.product-sticky-up').fadeOut(); // 隐藏图标，可以使用fadeOut动画效果
      }
    }
  });




  // 自动添加折扣
  setTimeout(function () {
    // 自动添加购物车
    var urlParams = new URLSearchParams(window.location.search);
    var pDiscount = urlParams.get("add-discount");
    var defDiscount = urlParams.get('discount');
    if (pDiscount) {
      setCookie('discount_code', pDiscount, 1);
      setTimeout(function () {
        addToCart(variantId);
        autoDiscountCode(pDiscount);
      }, 2000);
    } else if (defDiscount) {
      setCookie('discount_code', defDiscount, 1);
      setTimeout(function () {
        autoDiscountCode(defDiscount);
      }, 3000);
    } else {
      if ($('.p-box-discount-code').attr('auto-apply') == 'true') {
        let code = $('.p-box-discount-code').attr('auto-code');
        disCode = code;
        setCookie('discount_code', code, 1);
        autoDiscountCode(code);
      }
    }
  }, 1000)

  // 直接添加购物车
  $(document).on('click', '.button-buy-now ', function () {
    let pid = $(".product-form__buy-buttons [name='id']").val();
    let code = $('.p-box-discount-code').attr('auto-code');
    let giftParam = {};
    $('.button-buy-now').text('').attr('aria-busy', 'true');
    buyProduct(pid, giftParam, code);

    setTimeout(function () {
      $('.button-buy-now').text('Buy Now').attr('aria-busy', 'false');
    }, 2000);
  });


});

let swiperproductNav = null;
let swiperMain = null;
function initProductImages() {
  if (swiperproductNav !== null) {
    swiperproductNav.destroy(true, true);
  }
  swiperproductNav = new Swiper('.product-media-new .swiper_nav', {
    slidesPerView: 'auto',
    spaceBetween: 10,
    freeMode: true,
    simulateTouch: true, // 启用鼠标滑动支持
    mousewheel: true,
    // lazy: {
    //   loadPrevNext: true, // 预加载前后两张图片
    // },
    watchSlidesVisibility: true,
    watchSlidesProgress: true,
    breakpoints: {
      640: {
        direction: 'horizontal', // 小屏幕上水平方向滚动
      },
      1024: {
        direction: 'vertical', // 大屏幕上垂直方向滚动
      },
    }
  });
  if (swiperMain !== null) {
    swiperMain.destroy(true, true);
  }
  swiperMain = new Swiper('.product-media-new .swiper_main', {
    spaceBetween: 0,
    lazy: {
      loadPrevNext: true, // 预加载前后两张图片
    },
    loop: true,
    pagination: {
      el: '.swiper-pagination',
      clickable: true
    },
    navigation: {
      nextEl: '.swiper_main .swiper-button-next',
      prevEl: '.swiper_main .swiper-button-prev',
    },
    thumbs: {
      swiper: swiperproductNav,
    },
  });
}

function getUrlParameter(paramName) {
  // 创建一个URLSearchParams对象，用于解析URL中的查询参数
  const params = new URLSearchParams(window.location.search);
  // 使用指定的参数名获取参数值并返回
  return params.get(paramName);
}

function generateHtmlForVariant(vid) {
  let currentVariant = !vid ? variantArr[0] : vid;
  variantId = currentVariant.vid;
  let variant = getUrlParameter('variant');
  if (variant) {
    variantId = variant;
    currentVariant = variantArr.filter(item => item.vid == variant)[0];
  }


  const { position, max } = currentVariant;

  let _productHtml = '';
  let _productnavHtml = '';
  for (let i = position - 1; i < max; i++) {
    const ths = productMediaArr[i];
    let imageUrl = ths.src;
    let itemMainHtml = '';
    ths.alt = ths.alt ? ths.alt : 'Ulike Product Image';
    // 第一个直接加载 eager
    let loadingAttr = i == position - 1 ? 'fetchpriority="high"' : 'loading="lazy"';
    const pictureElement = `
    <picture>
        <source media="(max-width: 768px)" srcset="${convertShopifyImageUrl(imageUrl, '800x')}">
        <img class="product__media-image" ${loadingAttr} src="${convertShopifyImageUrl(imageUrl, '1740x')}" alt="${ths.alt}" media_type="${ths.media_type}" >
    </picture>
    `;

    if (ths.media_type == 'video') {
      imageUrl = ths.preview_image.src;
      itemMainHtml = generateVideoHtml(ths.sources);
    } else {
      itemMainHtml = `
        <a data-id="${i}" data-pswp-src="${imageUrl}" rel="nofollow" data-pswp-width="${ths.width}" 
        data-pswp-height="${ths.height}" alt="${ths.alt}" >
        ${pictureElement}
        </a> 
      `
    }
    _productHtml += `
       <div class="swiper-slide">${itemMainHtml}</div>`;
    _productnavHtml += `
        <div class="swiper-slide">
            <div class="responsive-clip-path">
              <img class="product__media-image" width="68px" height="63px"  ${loadingAttr} src="${convertShopifyImageUrl(imageUrl, '80x')}"  alt="${ths.alt}" media_type="${ths.media_type}"  />
            </div>
        </div>`;
  }
  setTimeout(function () {
    $('.swiper_main .swiper-wrapper').html(_productHtml);
    $('.swiper_nav .swiper-wrapper').html(_productnavHtml);
    initProductImages();
    // 3D 模型加载
    if (currentVariant.url) {
      $('.product-slider-btn-model').attr('attr-model-url', currentVariant.url).show();
    } else {
      $('.product-slider-btn-model').attr('attr-model-url', currentVariant.url).hide();
    }

    let _price = $(currentVariant.price).text().replace('£', '');
    if (currentVariant.isOriginalPrice == 'true') {
      // 显示原始价格
      console.log('原始价格', currentVariant);
      $('.p-box-price .price').html(currentVariant.price);
      $('.p-box-price .original_price').html(currentVariant.original_price);
      $('.pay-button').attr('data-pp-amount', currentVariant.price);
      $("klarna-placement").attr('data-purchase-amount', _price)
    } else {
      if (currentVariant.price != '' && currentVariant.page_price != '') {
        $('.p-box-price .price').html(formatMoney(currentVariant.page_price));
        $('.p-box-price .original_price').html(currentVariant.price);
        $('.pay-button').attr('data-pp-amount', currentVariant.page_price);

        $("klarna-placement").attr('data-purchase-amount', currentVariant.page_price * 100)
        setTimeout(function () {
          $("klarna-placement").attr('data-purchase-amount', currentVariant.page_price * 100)
        }, 2000)

      } else if (currentVariant.price != '') {
        $('.p-box-price .price').html(currentVariant.price);
        $('.pay-button').attr('data-pp-amount', $(currentVariant.price).text().replace('£', ''));
      }
    }

    if (currentVariant.variantTitle != '') {
      $('.product-info-new .product-meta__title').html(currentVariant.variantTitle);
    }

    // 产品增加添加购物车按钮修改配置
    let addToCartText = $('.product-form .btn-add-to-cart span').text().split('-');
    let showAddCartNum = $('.product-form .btn-add-to-cart').data('add-text');
    if (addToCartText.length > 1 && showAddCartNum == 2) {
      let cartText = addToCartText[0] + '-' + formatMoney(currentVariant.page_price);
      $('.product-form .btn-add-to-cart span').html(cartText);
    }

  }, 10)

}

/**
 * 将给定的Shopify图片URL转换为指定尺寸
 * 该函数主要用于根据Shopify图片URL生成不同尺寸的图片URL
 * 它通过在原始文件名和文件扩展名之间插入尺寸大小来实现URL的转换
 * 
 * @param {string} url - 原始Shopify图片的URL
 * @param {number} size - 想要转换的图片尺寸（以像素为单位）
 * @return {string} 转换后的图片URL
 */
function convertShopifyImageUrl(url, size) {
  if (url != undefined) {
    return url.replace(/(\.[^/.]+)$/, `_${size}$1`);
  }
  return url;
}
/**
 * 根据提供的视频数据生成视频HTML代码
 * 
 * 此函数首先对视频数据进行过滤和最大宽度查找，然后生成一个包含动态视频的HTML代码字符串
 * 生成的HTML代码包括一个video标签，其中包含多个source标签，每个标签指向一个视频文件
 * 如果浏览器不支持video标签，还会包含一个提示信息
 * 
 * @param {Array} videoData 视频数据数组，每个元素包含视频的URL和MIME类型
 * @returns {string} 生成的视频HTML代码字符串
 */
function generateVideoHtml(videoData) {
  // 过滤和查找最大宽度的视频数据
  var filteredData = filterAndFindMaxWidth(videoData);

  // 初始化视频HTML代码字符串
  var videoHtml = '<video id="dynamicVideo" autoplay muted loop playsinline controls>';

  // 遍历过滤后的视频数据
  Object.values(filteredData).forEach(function (video) {
    // 为每个视频生成source标签并添加到视频HTML代码中
    videoHtml += `<source src="${video.url}" type="${video.mime_type}">`;
  });

  // 完成视频HTML代码，包括对不支持video标签的浏览器的提示
  videoHtml += 'Your browser does not support the video tag.</video>';

  // 返回生成的视频HTML代码字符串
  return videoHtml;
}

function filterAndFindMaxWidth(data) {
  var result = {};
  data.forEach(function (item) {
    if (!result[item.mime_type] || item.width > result[item.mime_type].width) {
      result[item.mime_type] = item;
    }
  });
  return result;
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
  if (formatString.indexOf("with_comma_separator") !== -1) {
    return formatString.replace(placeholderRegex, value);
  } else {
    return formatString.replace(placeholderRegex, value);
  }
}