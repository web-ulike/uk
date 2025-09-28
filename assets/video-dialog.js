// 添加弹框视频

function popu(ele, type) {
  for (var i = 0; i < ele.length; i++) {
    ele[i].addEventListener("click", function (e) {
      let screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      e.preventDefault();
      var body = document.getElementsByTagName("body")[0];
      var w = document.createElement("aside");
      // 创建视频元素
      var videoPlayer  = document.createElement("video");
      videoPlayer.setAttribute("id", "videoPlayer");
      videoPlayer.setAttribute("controls", "true");
      videoPlayer.setAttribute("playsinline", "true");
      videoPlayer.setAttribute("muted", "muted");
      videoPlayer.setAttribute("preload", "metadata");
      videoPlayer.setAttribute("autoplay", "true");
      // 创建视频源元素
      var videoSource = document.createElement('source');
      document.body.style.overflow='hidden';
      document.body.style.height='100vh';
      w.setAttribute("id", "popu-cont");
      w.setAttribute("class", "popu-cont-cutom");
      if (type === "video") {
        w.innerHTML = '<div class="popu-mask" style="position: fixed;width: 100%;height: 100%;left: 0;right: 0;z-index: 1;"></div><div class="popu-wrap text-center video-wrapper--native "><svg width="32" height="32" viewBox="0 0 24 24" class="transition-linear close-btn"> <use xlink:href="#close-path"><path d="M11 11V6a1 1 0 0 1 2 0v5h5a1 1 0 0 1 0 2h-5v5a1 1 0 0 1-2 0v-5H6a1 1 0 0 1 0-2h5z"></path></use> </svg></div>';
        // var href = this.getAttribute("href");
        let href = this.getAttribute("data-mobile-href") ? (screenWidth < 768 ? this.getAttribute("data-mobile-href"):this.getAttribute("href")): this.getAttribute("href");
        videoSource.src = href;
        // 将视频源元素添加到视频元素中
        videoPlayer.appendChild(videoSource);
        w.querySelector(".popu-wrap").appendChild(videoPlayer);
      } 
      w.querySelector(".popu-wrap").classList.add(type);
      body.appendChild(w);
      clickCloseAll(".close-btn");
      clickCloseAll(".popu-mask");
      function clickCloseAll(className) {
        document.querySelector(className).addEventListener('click', function (e) {
        document.body.style='';
          if (isIE()) {
            document.getElementById("popu-cont").removeNode(!0)
          } else {
            document.getElementById("popu-cont").remove()
          }
        })
      }
      function isIE() {
        if (!!window.ActiveXobject || "ActiveXObject" in window) {
          return !0
        } else {
          return !1
        }
      }
    })
  }
}
popu(document.getElementsByClassName('popu-video'), "video");


function textDialog(ele) {
  for (var i = 0; i < ele.length; i++) {
    ele[i].addEventListener("click", function (e) {
      e.preventDefault();
      var body = document.getElementsByTagName("body")[0];
      var w = document.createElement("aside");
      document.body.style.overflow = 'hidden';
      document.body.style.height = '100vh';
      w.setAttribute("id", "popu-cont");
      w.setAttribute("class", "popu-cont-cutom popu-cont-cutom-txt");
      w.innerHTML = `<div class="popu-mask" style="position: fixed;width: 100%;height: 100%;left: 0;right: 0;z-index: 1;"></div>
      <div class="popu-wrap text-center"><svg width="32" height="32" viewBox="0 0 24 24" class="transition-linear close-btn"> <use xlink:href="#close-path"><path d="M11 11V6a1 1 0 0 1 2 0v5h5a1 1 0 0 1 0 2h-5v5a1 1 0 0 1-2 0v-5H6a1 1 0 0 1 0-2h5z"></path></use> </svg>
        <div class="popup_text-contend">
          <p style="margin-top: 0pt; margin-bottom: 0pt; page-break-inside: avoid; page-break-after: avoid; line-height: 170%; widows: 0; orphans: 0; font-size: 24pt;"><span style="font-weight: bold; color: #1a1a1a;">Summer Sale Giveaway RULES</span></p>
          <p style = "margin-top: 3pt; margin-bottom: 3pt; widows: 0; orphans: 0; font-size: 11pt;" > <span style="font-weight: bold; color: #333333;">This giveaway is to give back our precious customers for their support. </span></ >
          <p style="margin-top: 3pt; margin-bottom: 3pt; widows: 0; orphans: 0; font-size: 11pt;"><span style="font-weight: bold; color: #333333;">Higher Purchasing Amount WILL NOT Raise Your Chance of Winning the Prize. </span></p>
          <p style="margin-top: 3pt; margin-bottom: 3pt; widows: 0; orphans: 0; font-size: 11pt;"><span style="color: #333333;">&nbsp;</span></p>
          <ol type="1" style="margin: 0pt; padding-left: 0pt;">
          <li style="margin-top: 3pt; margin-left: 13.21pt; margin-bottom: 3pt; widows: 0; orphans: 0; padding-left: 3.59pt; font-size: 11pt; color: #333333;">
          <span style="font-weight: bold;">Eligibility:</span><span> Giveaway (the "giveaway") is open only to those who sign up at the online summer sale page, purchase an order on ulike.com during summer sale period and who are at least 18+ years old at the time of entry. The giveaway is open to legal residents in </span><span style="font-weight: bold;">the United States of America, the United Kingdom and Europe</span><span> and is void where prohibited by law and custom restrictions. Employees of Ulike (the "Sponsor") their respective affiliates, subsidiaries, advertising and promotion agencies, suppliers and their immediate family members and/or those living in the same household of each are not eligible to participate in the giveaway. The giveaway is subject to all applicable federal, state and local laws and regulations. Void where prohibited.</span>
          </li>
          <li style="margin-top: 3pt; margin-left: 13.21pt; margin-bottom: 3pt; widows: 0; orphans: 0; padding-left: 3.59pt; font-size: 11pt; color: #333333;">
          <span style="font-weight: bold;">Agreement to Rules:</span><span> By participating, you agree to be fully unconditionally bound by these Rules, and you represent and warrant that you meet the eligibility requirements set forth herein. In addition, you agree to accept the decisions of Ulike, as final and binding as it relates to the content. The giveaway is subject to all applicable federal, state and local laws.</span>
          </li>
          <li style="margin-top: 3pt; margin-left: 13.21pt; margin-bottom: 3pt; widows: 0; orphans: 0; padding-left: 3.59pt; font-size: 11pt; color: #333333;">
          <span style="font-weight: bold;">Gi</span><span style="font-weight: bold;">veaway Period:</span><span> Entries will be accepted online starting on or about June 8, 2023 at 00:00 AM and ending June 28, 2023 at 11:59 PM. All online entries must be received by June 28, 2023 at 11:59 PM. All times are Eastern Time (“ET”) (US &amp; Canada).</span>
          </li>
          <li style="margin-top: 3pt; margin-left: 13.21pt; margin-bottom: 3pt; widows: 0; orphans: 0; padding-left: 3.59pt; font-size: 11pt; color: #333333;">
          <span style="font-weight: bold;">How to Enter:</span><span> The giveaway must be entered by submitting an email address and purchasing any of the products on this site. The entry must fulfill all giveaway requirements, as specified, to be eligible to win a prize. Entries that are not complete or do not adhere to the rules or specifications may be disqualified at the sole discretion of Ulike. Limit one (1) entry per person, per household and per e-mail address for the duration of the giveaway Period. You may not enter more times than indicated by using multiple e-mail addresses, identities or devices in an attempt to circumvent the rules. If you use fraudulent methods or otherwise attempt to circumvent the rules your submission may be removed from eligibility at the sole discretion of Ulike.</span>
          </li>
          <li style="margin-top: 3pt; margin-left: 13.21pt; margin-bottom: 3pt; widows: 0; orphans: 0; padding-left: 3.59pt; font-size: 11pt; color: #333333;">
          <span style="font-weight: bold;">Prizes:</span><span> </span><span style="text-decoration: underline;">Grand Prize (1)</span><span>: One (1) $10,200.00 Chanel 2.55 Handbag, </span><span style="text-decoration: underline;">First Prize (2)</span><span>: One (1) $1,800.00 Chanel COCO BRACELET, </span><span style="text-decoration: underline;">Second Prizes (4)</span><span>: One $650 Chanel RECTANGLE SUNGLASSES, </span><span style="text-decoration: underline;">Third Prizes (30)</span><span>: One Free Order (Value according to the order). You are not guaranteed to win a prize and your chance of winning is dependent on the total number of eligible entries received. Actual/appraised value may differ at time of prize award. The specifics of the prize shall be solely determined by the Sponsor. No cash or other prize substitution permitted except at Sponsor's discretion. The prize is nontransferable. Any and all prize related expenses, including without limitation any and all federal, state, and local taxes shall be the sole responsibility of the winner. No substitution of prize or transfer/assignment of prize to others or request for the cash equivalent by winners is permitted. Acceptance of prize constitutes permission for Ulike to use winner's name, likeness, and entry for purposes of advertising and trade without further compensation, unless prohibited by law.</span>
          </li>
          <li style="margin-top: 3pt; margin-left: 13.21pt; margin-bottom: 3pt; widows: 0; orphans: 0; padding-left: 3.59pt; font-size: 11pt; color: #333333;">
          <span style="font-weight: bold;">Odds:</span><span> The odds of winning depend on the number of eligible entries received.</span>
          </li>
          </ol>
          <ol start="7" type="1" style="margin: 0pt; padding-left: 0pt;">
          <li style="margin-top: 3pt; margin-left: 13.21pt; margin-bottom: 3pt; widows: 0; orphans: 0; padding-left: 3.59pt; font-size: 11pt; color: #333333;">
          <span style="font-weight: bold;">Winner selection and notification</span><span>: Winners of the giveaway will be selected in a random drawing under the supervision of the Sponsor on July 5, 2023. Winners will be notified via e-mail to the e-mail address they entered the giveaway with within five (5) days following the winner selection. Ulike shall have no liability for a winner's failure to receive notices due to winners' spam, junk e-mail or other security settings or for winners' provision of incorrect or otherwise non-functioning contact information. If the selected winner cannot be contacted, is ineligible, fails to claim the prize within 15 days from the time award notification was sent, or fails to timely return a completed and executed declaration and releases as required, prize may be forfeited and an alternate winner selected. The receipt by winner of the prize offered in this giveaway is conditioned upon compliance with any and all federal and state laws and regulations. ANY VIOLATION OF THESE OFFICIAL RULES BY ANY WINNER (AT SPONSOR'S SOLE DISCRETION) WILL RESULT IN SUCH WINNER'S DISQUALIFICATION AS WINNER OF THE giveaway AND ALL PRIVILEGES AS WINNER WILL BE IMMEDIATELY TERMINATED. </span>
          </li>
          </ol>
          <p style="margin-top: 3pt; margin-left: 16.8pt; margin-bottom: 3pt; widows: 0; orphans: 0; font-size: 11pt;"><span style=">THE 90-DAY NO-QUESTIONS-ASKED RETURN POLICY IS NOT APPLICABLE FOR THE WINNER. </span></p>
          <ol start="8" type="1" style="margin: 0pt; padding-left: 0pt;">
          <li style="margin-top: 3pt; margin-left: 13.21pt; margin-bottom: 3pt; widows: 0; orphans: 0; padding-left: 3.59pt; font-size: 11pt; color: #333333;">
          <span style="font-weight: bold;">Rights Granted by you</span><span>: By entering this content you understand that Ulike, anyone acting on behalf of Ulike, or its respective licensees, successors and assigns will have the right, where permitted by law, without any further notice, review or consent to print, publish, broadcast, distribute, and use, worldwide in any media now known or hereafter in perpetuity and throughout the World, your entry, including, without limitation, the entry and winner's name and email adress as news, publicity or information and for trade, advertising, public relations and promotional purposes without any further compensation.</span>
          </li>
          <li style="margin-top: 3pt; margin-left: 13.21pt; margin-bottom: 3pt; widows: 0; orphans: 0; padding-left: 3.59pt; font-size: 11pt; color: #333333;">
          <span style="font-weight: bold;">Terms</span><span>: Ulike reserves the right, in its sole discretion to cancel, terminate, modify or suspend the giveaway should (in its sole discretion) a virus, bugs, non-authorized human intervention, fraud or other causes beyond its control corrupt or affect the administration, security, fairness or proper conduct of the giveaway. In such case, Ulike may select the recipients from all eligible entries received prior to and/or after (if appropriate) the action taken by Ulike. Ulike reserves the right at its sole discretion to disqualify any individual who tampers or attempts to tamper with the entry process or the operation of the giveaway or website or violates these Terms &amp; Conditions.</span>
          </li>
          </ol>
          <p style="margin-top: 3pt; margin-left: 16.8pt; margin-bottom: 3pt; widows: 0; orphans: 0; font-size: 11pt;"><span style="color: #333333;">Ulike has the right, in its sole discretion, to maintain the integrity of the giveaway, to void votes for any reason, including, but not limited to; multiple entries from the same user from different IP addresses; multiple entries from the same computer in excess of that allowed by giveaway rules; or the use of bots, macros or scripts or other technical means for entering. Any attempt by an entrant to deliberately damage any web site or undermine the legitimate operation of the giveaway may be a violation of criminal and civil laws and should such an attempt be made, Ulike reserves the right to seek damages from any such person to the fullest extent permitted by law.</span></p>
          <p style="margin-top: 3pt; margin-left: 16.8pt; margin-bottom: 3pt; widows: 0; orphans: 0; font-size: 11pt;"><span style="color: #333333;">By entering the giveaway you agree to receive email newsletters periodically from Ulike. You can opt-out of receiving this communication at any time by clicking the unsubscribe link in the newsletter.</span></p>
          <ol start="10" type="1" style="margin: 0pt; padding-left: 0pt;">
          <li style="margin-top: 3pt; margin-left: 16.8pt; margin-bottom: 3pt; widows: 0; orphans: 0; font-size: 11pt; color: #333333;">
          <span style="font-weight: bold;">Limitation of Liability</span><span>: By entering you agree to release and hold harmless Ulike and its subsidiaries, affiliates, advertising and promotion agencies, partners, representatives, agents, successors, assigns, employees, officers and directors from any liability, illness, injury, death, loss, litigation, claim or damage that may occur, directly or indirectly, whether caused by negligence or not, from (i) such entrant's participation in the giveaway and/or his/her acceptance, possession, use, or misuse of any prize or any portion thereof, (ii) technical failures of any kind, including but not limited to the malfunctioning of any computer, cable, network, hardware or software; (iii) the unavailability or inaccessibility of any transmissions or telephone or Internet service; (iv) unauthorized human intervention in any part of the entry process or the Promotion; (v) electronic or human error which may occur in the administration of the Promotion or the processing of entries.</span>
          </li>
          <li style="margin-top: 3pt; margin-left: 16.8pt; margin-bottom: 3pt; widows: 0; orphans: 0; font-size: 11pt; color: #333333;">
          <span style="font-weight: bold;">Privacy Policy</span><span>: Information submitted with an entry is subject to the Privacy Policy stated on the Ulike Web Site. Read the Privacy Policy here: </span><a href="https://uk.ulike.com/pages/privacy-policy" target="dlt" style="text-decoration: none;"><span style="text-decoration: underline; color: #0563c1;"> [Official] Privacy Policy - Ulike </span></a>
          </li>
          </ol>
          <ol start="12" type="1" style="margin: 0pt; padding-left: 0pt;">
          <li style="margin-top: 3pt; margin-left: 16.8pt; margin-bottom: 3pt; widows: 0; orphans: 0; font-size: 11pt; color: #333333;">
          <span style="font-weight: bold;">Winners List</span><span>: Winners will be announced on the Summer Sale page and our official social network. For the names of the winners, please contact us at and in the body of the email type 'Please e-mail me the winners' list for the Ulike giveaway.</span>
          </li>
          <li style="margin-top: 3pt; margin-left: 16.8pt; margin-bottom: 3pt; widows: 0; orphans: 0; font-size: 11pt; font-weight: bold;"><span>Sponsor: The Sponsor of the giveaway is </span></li>
          </ol>
          <p style="margin-top: 3pt; margin-left: 16.8pt; margin-bottom: 3pt; widows: 0; orphans: 0; font-size: 11pt;"><span>AMERICA ULIKE INTERNATIONAL INC., 300 Lenora Street #1096, Seattle, WA 98121, United States.</span></p>
        </div>
      </div>`;
      body.appendChild(w);
      clickCloseAll(".close-btn");
      clickCloseAll(".popu-mask");
      function clickCloseAll(className) {
        document.querySelector(className).addEventListener('click', function (e) {
          document.body.style = '';
          if (isIE()) {
            document.getElementById("popu-cont").removeNode(!0)
          } else {
            document.getElementById("popu-cont").remove()
          }
        })
      }
      function isIE() {
        if (!!window.ActiveXobject || "ActiveXObject" in window) {
          return !0
        } else {
          return !1
        }
      }
    })
  }
}

textDialog(document.getElementsByClassName('slideshow__btn-link'));

/**
 * 
 * @param {产品id} productId 
 * @param {按钮是否需要动画} button 
 * @param {扩展字段} properties 
 * @returns 
 */
function addToCart(productId, button, properties,code='') {
  // 获取文本元素和加载动画元素
 let textElement ;
 let loaderElement;
  if(button){
    textElement = button.querySelector('.loader-button__text');
    loaderElement = button.querySelector('.loader-button__loader');

     if(button.disabled) return
     // 禁用按钮
     button.setAttribute("disabled", "disabled");
     button.setAttribute("aria-busy", "true");
     // 显示加载动画
     textElement.hidden = true;
     loaderElement.hidden = false;
  }

  console.log(properties);
  if(code){
    autoDiscountCode(code);
  }
 fetch('/cart/add.js', {
   method: 'POST',
   headers: {
     'Content-Type': 'application/json',
   },
   body: JSON.stringify({
     id: productId,
     quantity: 1, // 可根据需求设置购买数量
     properties
   }),
 })
   .then(response => response.json())
   .then(data => {
     // 添加购物车成功后的处理逻辑
     console.log('Product added to cart:', data);
     // 获取购物车列表
     fetch('/cart.js')
       .then(response => response.json())
       .then(cartData => {
         // 获取购物车列表成功后的处理逻辑
         console.log('Cart contents:', cartData);
         cartData["sections"] = data["sections"];
         document.documentElement.dispatchEvent(new CustomEvent("cart:refresh", {
           bubbles: true,
           detail: {
             cart: cartData,
             openMiniCart: window.themeVariables.settings.cartType === "drawer"
           }
         }));
          if(button){
           // 恢复按钮状态
           button.removeAttribute("disabled");
           button.removeAttribute("aria-busy");
           // 显示 "Add to Cart"，隐藏加载动画
           textElement.hidden = false;
           loaderElement.hidden = true;
          }
       })
       .catch(error => {
         // 获取购物车列表失败的处理逻辑
         console.error('Error getting cart contents:', error);
         if(button){
           // 恢复按钮状态
           button.removeAttribute("disabled");
           button.removeAttribute("aria-busy");
           // 显示 "Add to Cart"，隐藏加载动画
           textElement.hidden = false;
           loaderElement.hidden = true;
         }
       });
   })
   .catch(error => {
     // 添加购物车失败的处理逻辑
     console.error('Error adding product to cart:', error);
   });
}

// 加购处理回调
function addToCartPromise(
  productId,
  button,
  properties,
  code = "",
  quantity = 1
) {
  return new Promise((resolve, reject) => {
    // 获取文本元素和加载动画元素
    var textElement;
    var loaderElement;
    if (button) {
      textElement = button.querySelector(".loader-button__text");
      loaderElement = button.querySelector(".loader-button__loader");

      if (button.disabled) return;
      // 禁用按钮
      button.setAttribute("disabled", "disabled");
      button.setAttribute("aria-busy", "true");
      // 显示加载动画
      textElement.hidden = true;
      loaderElement.hidden = false;
    }

    console.log(properties);

    if (code) {
      autoDiscountCode(code);
    }

    fetch("/cart/add.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: productId,
        quantity: quantity, // 可根据需求设置购买数量
        properties,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        // 获取购物车列表
        return fetch("/cart.js")
          .then((response) => response.json())
          .then((cartData) => {
            cartData["sections"] = data["sections"];
            document.documentElement.dispatchEvent(
              new CustomEvent("cart:refresh", {
                bubbles: true,
                detail: {
                  cart: cartData,
                  openMiniCart:
                    window.themeVariables.settings.cartType === "drawer",
                },
              })
            );

            if (button) {
              // 恢复按钮状态
              button.removeAttribute("disabled");
              button.removeAttribute("aria-busy");
              // 显示 "Add to Cart"，隐藏加载动画
              textElement.hidden = false;
              loaderElement.hidden = true;
            }

            // Resolve the Promise with the cart data
            resolve(cartData);
          });
      })
      .catch((error) => {
        console.error(
          "Error adding product to cart or getting cart contents:",
          error
        );

        if (button) {
          // 恢复按钮状态
          button.removeAttribute("disabled");
          button.removeAttribute("aria-busy");
          // 显示 "Add to Cart"，隐藏加载动画
          textElement.hidden = false;
          loaderElement.hidden = true;
        }

        // Reject the Promise with the error
        reject(error);
      });
  });
}

function buyProduct(productId, properties) {
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
        properties
      }),
    })
    .then(response => response.json())
    .then(data => {
      fetch('/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: productId,
          quantity: 1,
          form_type: 'product',
          utf8: '✓'
        }),
      })
      .then(response => {
        console.log('response', response)
        if (response.status === 302) {
          // 获取重定向的 URL
          const redirectUrl = response.headers.get('Location');
          // 执行重定向
          window.location.href = redirectUrl;
        } else {
          // 处理其他状态码的逻辑
          return response
        }
      })
      .then(data => {
        // 处理购买成功后的逻辑
        console.log('Purchase successful:', data);
         // 执行跳转
         window.location.href = data.url;
        // 可以根据需求执行其他操作，例如显示购买成功提示、跳转到订单页面等
      })
      .catch(error => {
        // 处理购买失败的逻辑
        console.error('Purchase failed:', error);
        // 可以根据需求执行其他错误处理操作
      });
    }).catch(error => {
    // 添加购物车失败，处理错误
    console.error('Error clearing cart:', error);
  });
    
  })
  .catch(error => {
    // 清空购物车失败，处理错误
    console.error('Error clearing cart:', error);
  });
}

//复制折扣码方法 start
function copyCode(code, codeTxt, bt){
  navigator.clipboard.writeText(code);
  bt.innerHTML = 'Copied';
 setTimeout(()=>{
  bt.innerHTML = codeTxt;
 },7000)
}
//复制折扣码方法 start
function copyCodeExtend(code, codeTxt, bt,event){
  // 阻止默认事件
  event.preventDefault();
  event.stopPropagation();
  navigator.clipboard.writeText(code);
  bt.innerHTML = 'Copied';
 setTimeout(()=>{
  bt.innerHTML = codeTxt;
 },7000)
}

 // 定义函数来滚动到特定的 section
function scrollToSection(sectionId) {
  var section = document.getElementById(sectionId);
  section.scrollIntoView({ behavior: 'smooth' });
}

class ImgPlay {
  constructor(cont,urlRoot,maxLength) {
    this.urlRoot = urlRoot;
    this.indexRange = [0, maxLength - 1];
    this.maxLength = maxLength
    this.eleContainer = document.querySelector(cont);
    this.percent = 0
    this.store = {
      length: 0
    }
    this.isPlay = false
    this.pictureNum = null
  }

  loadImg(){
    // 图片序列预加载
    for ( let start = this.indexRange[0]; start <= this.indexRange[1]; start++) {
        ((index)=> {
          let that = this
          let img = new Image();
            img.onload = function () {
                that.store.length++;
                // 存储预加载的图片对象
                that.store[index] = this;
                that.updateLoading();
            };
            img.onerror = function () {
              that.store.length++;
              that.updateLoading();
            };
            img.src = that.urlRoot + index + '.jpg';
        })(start);
    }
  }

  updateLoading(){
    // loading进度
    this.percent = Math.round(100 * this.store.length / this.maxLength);
    if(this.percent == 100 && this.isPlay){
      this.playImg(this.pictureNum)
    }
  }

  playImg(num = null){
    // 全部加载完毕，无论成功还是失败
    if (this.percent == 100) {
      let index = num || this.indexRange[0];
      this.eleContainer.innerHTML = '';
      // 依次append图片对象
      let step = ()=> {
          if (this.store[index - 1] && num == null) {
              this.eleContainer.removeChild(this.store[index - 1]);
          }
          this.eleContainer.appendChild(this.store[index]);
          // 序列增加
          index++;
          // 如果超过最大限制
          if (index <= this.indexRange[1]) {
            if(num == null){
              setTimeout(step, 42);
            }else{

            }
          } else {
              // 本段播放结束回调
              // 我这里就放一个重新播放的按钮
              // this.eleContainer.insertAdjacentHTML('beforeEnd', '<button onclick="">再看一遍</button>');
          }
      };
      if(num == null){
        // 等100%动画结束后执行播放
        setTimeout(step, 100);
      }else{
        step()
      }
      
    }else{
      this.isPlay = true
      this.pictureNum = num
    }
  }
}

class Countdown {
    constructor(endTime, elName,loop = null) {
      this.displayElement = document.querySelector(elName);
      this.timer = null;
      this.loop = loop
      this.setEndTime(endTime);
      this.start();
      this.locaName = elName+'loopTime'
    }
    setEndTime(endTime) {
      if (endTime) {
        this.endTime = new Date(endTime).getTime();
      } else {
        if(this.loop){
          let locTime = localStorage.getItem(this.locaName);
          if(locTime && locTime*1 > new Date().getTime()){
            this.endTime = locTime*1
          }else{
            this.endTime = new Date().getTime() + 2 * 24 * 60 * 60 * 1000;
            localStorage.setItem(this.locaName, this.endTime)
          }
        }else{
          this.endTime = new Date().getTime();
        }
      }
    }
    start() {
      this.timer = setInterval(() => this.update(), 1000);
    }

    update() {
      const now = new Date().getTime();
      const distance = this.endTime - now;
      let hours = 0;
      let minutes = 0;
      let seconds = 0;

      if (distance < 0) {
        if(this.loop){
          this.endTime = new Date().getTime() + 2 * 24 * 60 * 60 * 1000;
          localStorage.setItem(this.locaName, this.endTime)
        }else{
          clearInterval(this.timer);
          hours = 0;
          minutes = 0;
          seconds = 0;
        }
        
      }else{
        hours = Math.floor(distance / (1000 * 60 * 60));
        minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        seconds = Math.floor((distance % (1000 * 60)) / 1000);
      }

 // 假设 this.displayElement 是倒计时显示的父元素

if (this.displayElement) {
  const hoursElement = this.displayElement.querySelector('.h');
  const minutesElement = this.displayElement.querySelector('.m');
  const secondsElement = this.displayElement.querySelector('.s');

  if (hoursElement && minutesElement && secondsElement) {
      hoursElement.innerHTML = this.formatTime(hours);
      minutesElement.innerHTML = this.formatTime(minutes);
      secondsElement.innerHTML = this.formatTime(seconds);
  }
}

    }
    formatTime(time) {
      return time < 10 ? `0${time}` : time;
    }
  }

  // 按钮添加loading
function btnShowLoading($p, isShow = true) {
  if (isShow) {
    $p.addClass("loading-btn-cus");
    $p.append('<span class="loading-span"></span>');
  } else {
    $p.removeClass("loading-btn-cus");
    $p.find(".loading-span").remove();
  }
}