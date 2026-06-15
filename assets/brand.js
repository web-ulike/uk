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
    const text = heading.getAttribute('aria-label'); // 获取文字
    heading.innerHTML = ''; // 清空原内容

    // 逐字拆分
    const chars = text.split('').map((char, i) => {
        const span = document.createElement('span');
      span.textContent = char === ' ' ? '\u00A0' : char;
        span.style=`--i:${i};--char-delay:0.06s`
        heading.appendChild(span);
        return span;
    });
});



