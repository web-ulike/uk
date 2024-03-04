// 获取所有具有指定类名的元素
// const animateElements = document.querySelectorAll('.to-left,.to-edge,.to-top,.slide-to-left,.to-opacity,.to-top1,.text-top,.text-top-btn,.slide-to-left-white');
                        
// 计算阈值
const threshold = window.innerHeight + 100;

// 检查元素是否在视口内的函数
function isElementInViewport(element,index) {
  const bounding = element.getBoundingClientRect();
  return (
    // bounding.top >= 0 &&
    // bounding.top <= threshold
    bounding.bottom >= 0 &&
    bounding.top <= threshold
  );
}

// 监听滚动事件
function handleScroll() {
  const animateElements = document.querySelectorAll('.to-left,.to-edge,.to-top,.slide-to-left,.to-opacity,.to-top1,.text-top,.text-top-btn,.slide-to-left-white');
  animateElements.forEach((element,index) => {
    if (!element.classList.contains('appear') && isElementInViewport(element,index)) {
      element.classList.add('appear');
    }
  });
}

// 初始检查，如果元素初始位置已经在视口中，则立即触发动画
window.initialCheck = function () {
  const animateElements = document.querySelectorAll('.to-left,.to-edge,.to-top,.slide-to-left,.to-opacity,.to-top1,.text-top,.text-top-btn,.slide-to-left-white');
    animateElements.forEach((element,index) => {
    if (isElementInViewport(element,index)) {
      element.classList.add('appear');
    }
  });
}

// 在页面加载时和滚动时都执行初始检查
window.addEventListener('load', initialCheck);
window.addEventListener('scroll', handleScroll);


function wrapWordsWithSpanAndAddClass(node) {
    if (node.nodeType === Node.TEXT_NODE) {
        const textContent = node.textContent;
        const words = textContent.split(/\s+/);

        if (words.length > 1) {
            const spanFragment = document.createDocumentFragment();
            words.forEach((word, index) => {
                if (word) {
                    const wordNode = document.createElement('span');
                    wordNode.textContent = word;
                    spanFragment.appendChild(wordNode);

                    if (index < words.length - 1) {
                        spanFragment.appendChild(document.createTextNode(' '));
                    }
                }

            });

            node.parentNode.insertBefore(spanFragment, node);
            node.remove();
        }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.childNodes.length === 0) {
            node.classList.add('text-oth');
        } else {
            const childNodes = Array.from(node.childNodes);
            childNodes.forEach(childNode => {
                wrapWordsWithSpanAndAddClass(childNode);
            });
        }
    }
}

function getInitialTransitionDelay(node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
        const computedStyle = window.getComputedStyle(node);
        const transitionDelay = computedStyle.transitionDelay;
        if (transitionDelay !== '0s') {
            return parseFloat(transitionDelay) || 0;
        }
    }
    return 0;
}

let transitionDelayCounter = 0;

function addTransitionDelay(node, initialDelay) {
    if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName === 'SPAN' || node.classList.contains('text-oth')) {
            node.style.transitionDelay = `${initialDelay + transitionDelayCounter * 0.1}s`;
            transitionDelayCounter += 0.5;
        }

        for (const childNode of node.childNodes) {
            addTransitionDelay(childNode, initialDelay);
        }
    }
}

// 选择你想要遍历的根节点，这里假设根节点有 id 为 "content"
// const rootElement = document.getElementById('content');
document.querySelectorAll(".text-top").forEach(el => {
    transitionDelayCounter = 0
    wrapWordsWithSpanAndAddClass(el);
    addTransitionDelay(el, getInitialTransitionDelay(el));
})