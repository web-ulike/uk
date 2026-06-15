// 缓存需要添加动画的元素
const classNames = '.js-bounce,.js-brand-line';
const animateElements = document.querySelectorAll(classNames);

// IntersectionObserver 配置
const observerOptions = {
  root: null, // 使用视口作为容器
  rootMargin: '0px 0px 50px 0px', // 提前 50px 触发动画
  threshold: 0.2, // 元素 10% 可见时触发
};

// IntersectionObserver 回调
function handleIntersect(entries, observer) {
  entries.forEach(entry => {
    const isRepeatable = entry.target.hasAttribute('data-repeat');
    if (entry.isIntersecting) {
      // 添加动画类
      entry.target.classList.add('appear');

     if (!isRepeatable) {
        observer.unobserve(entry.target);
      }
    }
    else {
      if (isRepeatable) {
        entry.target.classList.remove('appear');
      }
    }
  });
}

// 创建 IntersectionObserver 实例
const observer = new IntersectionObserver(handleIntersect, observerOptions);

// 分批注册观察器
function batchObserve(elements, batchSize = 10) {
  let index = 0;
  function observeBatch() {
    const batch = Array.from(elements).slice(index, index + batchSize);
    batch.forEach(el => observer.observe(el));
    index += batchSize;

    // 如果还有未处理的元素，继续批量注册
    if (index < elements.length) {
      requestIdleCallback ? requestIdleCallback(observeBatch) : setTimeout(observeBatch, 50);
    }
  }
  observeBatch(); 
}

// 初始化观察
batchObserve(animateElements, 20);


const headings = document.querySelectorAll('.js-bounce');

headings.forEach(heading => {
    const text = heading.getAttribute('aria-label'); 
    heading.innerHTML = ''; 

    // 逐字拆分
    const chars = text.split('').map((char, i) => {
        const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
        span.style=`--i:${i};--char-delay:0.06s`
        heading.appendChild(span);
        return span;
    });
});

class CustomSwiperNew extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.initSwiper();
  }

  initSwiper() {
    const swiperContainer = this.querySelector('.swiper-container');
    if (!swiperContainer) {
      console.error('Swiper container not found');
      return;
    }

    // **设备判断：是否禁用 Swiper**
    const disableOn = this.getAttribute('disable-on'); // 'mobile' 或 'desktop'
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    if ((disableOn === 'mobile' && isMobile) || (disableOn === 'desktop' && !isMobile)) {
      console.log(`Swiper disabled on ${disableOn}`);
      return;
    }

    // **Swiper 组件参数**
    const slidesPerView = parseFloat(this.getAttribute('slides-per-view')) || 1.3;
    const spaceBetween = parseFloat(this.getAttribute('space-between')) || 10;
    const loop = this.getAttribute('loop') !== 'false'; // 默认为 true
    const centeredSlides = this.getAttribute('centered-slides') !== 'false'; // 默认为 true
    const paginationEnabled = this.getAttribute('pagination') === 'true'; // 是否启用分页
    const navigationEnabled = this.getAttribute('navigation') === 'true'; // 是否启用导航按钮
    let breakpoints = {};
    try {
      breakpoints = JSON.parse(this.getAttribute('breakpoints') || '{}');
    } catch (error) {
      console.error('Invalid breakpoints format. Expected JSON.');
    }

    const prevButton = navigationEnabled ? this.querySelector('.swiper-prev') : null;
    const nextButton = navigationEnabled ? this.querySelector('.swiper-next') : null;
    const paginationEl = paginationEnabled ? { el: this.querySelector('.swiper-pagination'), clickable: true } : false;

    this.swiper = new Swiper(swiperContainer, {
      slidesPerView,
      spaceBetween,
      loop,
      centeredSlides,
      navigation: navigationEnabled ? { prevEl: prevButton, nextEl: nextButton } : false,
      pagination: paginationEl,
      breakpoints
    });
  }
}

window.customElements.define('custom-swiper-new', CustomSwiperNew);



