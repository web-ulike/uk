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





ScrollTrigger.config({ ignoreMobileResize: true });

let mm = gsap.matchMedia();

mm.add({
  isDesktop: "(min-width: 1024px)",
  isMobile: "(max-width: 1023px)"
}, (context) => {
  let { isDesktop, isMobile } = context.conditions;


  const images = gsap.utils.toArray(".exclusive-care-space__image");

images.forEach((img) => {
  const speed = isMobile ? img.getAttribute("mobile-data-speed") || 1 :  img.getAttribute("data-speed") || 1;   
  gsap.to(img, {
    yPercent: -100 * speed, 
    ease: "none",
    scrollTrigger: {
      trigger: ".exclusive-care-space-box",
      start: "top bottom",
      end: "bottom bottom",
      scrub: 1
    }
  });
});


})


class LuxuryVideoModal extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
      <div class="luxury-video-overlay">
        <div class="luxury-video-bg"></div>
        <div class="luxury-video-content">
          <button class="luxury-video-close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <div class="luxury-video-wrapper">
            <video controls playsinline></video>
          </div>
        </div>
      </div>
    `;

    this.overlay = this.querySelector('.luxury-video-overlay');
    this.bg = this.querySelector('.luxury-video-bg');
    this.closeBtn = this.querySelector('.luxury-video-close');
    this.videoEl = this.querySelector('video');

    this.close = this.close.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);

    this.closeBtn.addEventListener('click', this.close);
    this.bg.addEventListener('click', this.close);
  }

  disconnectedCallback() {
    this.closeBtn.removeEventListener('click', this.close);
    this.bg.removeEventListener('click', this.close);
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown(e) {
    if (e.key === "Escape") this.close();
  }

  open(videoUrl) {
    if (!videoUrl) return;

    this.videoEl.src = videoUrl;
    document.addEventListener('keydown', this.handleKeyDown);
document.body.classList.add('no-scroll');
    requestAnimationFrame(() => {
      this.overlay.classList.add('is-active');
    });
    
    this.videoEl.play();
  }

  close() {
    document.removeEventListener('keydown', this.handleKeyDown);
    
    this.overlay.classList.remove('is-active');
document.body.classList.remove('no-scroll');
    setTimeout(() => {
      this.videoEl.pause();
      this.videoEl.currentTime = 0;
      this.videoEl.src = '';
    }, 400); 
  }
}

customElements.define('luxury-video-modal', LuxuryVideoModal);


document.addEventListener('DOMContentLoaded', () => {
  const modalComponent = document.getElementById('globalVideoModal');
  const playBtns = document.querySelectorAll('.play-button');
  playBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      const videoUrl = this.getAttribute('data-video');
      modalComponent.open(videoUrl);
    });
  });
});
