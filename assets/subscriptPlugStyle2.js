var turntable = {
  itemNum: 6, // 转盘平均分几块
  targetId: 0,
  turntable: $('#turntable'), // 转盘
  bg: null, // 转盘背景
  gift: null, // 转盘上的中奖结果图
  pointer: null, // 转盘指针
  lottery: [], // 中奖数据
  isGoing: false, // 游戏是否开始
  init() {
    if (!this.lottery.length) {
      $(this.pointer).hide();
      throw new Error('请设置中奖结果数据');
    }
    // 初始化转盘背景、转盘上的中奖图（用不同背景色代替）
    let bgItemWidth = $(this.bg).width() / this.itemNum;
    var _clipPath = '';
    switch (this.itemNum) {
      case 2:
        _clipPath = 'polygon(-8% 50%, 100% 50%, 100%  -130%)';
        break;
      case 3:
        _clipPath = 'polygon(50% 50%,95% 16%,-330px -76%)';
        break;
      case 4:
        _clipPath = 'polygon(50% 50%,100% 0%,0% 0%)';
        break;
      case 5:
        _clipPath = 'polygon(50% 50%,100% 76%,100% 0%)';
        break;
      case 6:
        _clipPath = 'polygon(50% 50%,-20% -70%, 110% -50%)';
        break;
      case 7:
        _clipPath = 'polygon(30% 80%, 80% 10%, 10% 20%)';
        break;
      case 8:
        _clipPath = 'polygon(50% 50%, 100% 30%, 88% -48%)';
        break;
      case 9:
        _clipPath = 'polygon(50% 50%, 100% 23%, 100% -100%)';
        break;
    }
    $('#subscript-plug').css({ '--var-clip-path': _clipPath })
    for (let i = 0; i < this.itemNum; i++) {
      let deg = (360 / this.itemNum) * i;

      // 渐变色判断
      var _bgColorHtml = this.lottery[i].bgColor;
      if (this.lottery[i].bg2Color) {
        _bgColorHtml = `linear-gradient(to bottom, ${this.lottery[i].bgColor}, ${this.lottery[i].bg2Color})`;
      }
      // 判断是否有2个颜色；
      $('<li>').css({
        'transform': `rotate(${deg}deg)`,
        'background': _bgColorHtml
      }).appendTo(this.bg);

      let prizeFontSize = isMobile() ? this.lottery[i].mfontSize : this.lottery[i].fontSize;
      let giftItem = $('<li>').addClass('active').css(
        {
          'transform': `rotate(${deg}deg)`,
          "color": this.lottery[i].fontColor,
          "font-size": prizeFontSize + 'px'
        });
      let imgUrl = '';

      // 处理名称
      let prizeName = this.lottery[i].title;
      let nameHtml = `<span class="sub-name">${prizeName}</span>`
      if (this.lottery[i].itemType == 'COUPON'){
        let _rotate = 'style="transform: rotate(90deg);"';
        if(i == 1){
          _rotate = 'style="transform: rotate(-90deg);"';
        }
        nameHtml = `<span class="sub-name" index=${i} ${_rotate} ><div class="award-coupon" >
                <img alt="${prizeName} coupon" src="https://cdn.shopify.com/s/files/1/0740/5882/6015/files/20240911-100539.png?v=1726024646" loading="lazy">
                <div class="dispatch-coupon-txt" data-text="${prizeName}" ><span>${prizeName}</span></div>
              </div></span>`
      } else {
        if (this.lottery[i].url) {
          imgUrl = `<img src="${this.lottery[i].url}" alt="${prizeName} image" loading="lazy" />`;
        }
      }
     
      // }
      $(`<div class="prize-item">
            ${nameHtml}
            ${imgUrl}
          </div>`).appendTo(giftItem);
      $(this.gift).append(giftItem);
    }
  },

  gameStart(data) {
    if (this.isGoing) {
      return;
    }
    // 重置转盘样式
    $('.turntable').removeClass('spin-start');
    $('#turntable').css({
      'transform': '',
      'transition': ''
    });

    this.isGoing = true;
    // 根据随机数，得到中奖结果
    let res = this.lottery.find(item => item.title == data.benefitName);
    
    // 2. 计算旋转角度, 需要多转5圈，达转1圈用时1s, 到旋转的效果
    let rotateItemDeg = (this.lottery.length - res.location) * (360 / this.lottery.length); // 每个item旋转角度, 第一个不用旋转
    let rotate = rotateItemDeg + this.lottery.length * 360 * 1.5;
    let rotateSpeed = (rotateItemDeg / 360 * this.lottery.length).toFixed(2) + 1;

    setTimeout(function () {
      $('#turntable').css({
        'transform': `rotate(${rotate}deg)`,
        'transition': `transform ${rotateSpeed}s cubic-bezier(0.5, 0.1, 0.1, 1)`
      });
    }, 10)
    data.winning_title = languageMessageDtoList.winning_title;
    data.winning_sub_title = languageMessageDtoList.winning_sub_title;
    data.winning_code_title = languageMessageDtoList.winning_code_title;
    data.prizeUrl = res.url;
    commonGtmEvent('参与页成功订阅', 'subscriptPlug', '');

    // 3. 动画结束，显示中奖结果，中奖结果如何显示，视实际情况而定
    sendApiRequest('/promotion/queryVariant', { variantId: data.extend.participantId }).then((res) => {
      if (res.code === 0) {

        let variantData = res.data;
        data.award_info = _formActive.award_info;
        data.userEmail = subscribeObj.userEmail;
        data.variantData = variantData;
        setTimeout(function () {
          this.isGoing = false;
          subscriptPlug.find('#myConfettiDiv').show();
          // 烟花特效
          const canvas = document.getElementById('confettiCanvas');
          const myConfetti = confetti.create(canvas, {
              resize: true,
              useWorker: true
          });
          myConfetti({
            particleCount: 400,
            spread: 100,
            origin: { y: 0.6 },
            colors: ['#F2D08E', '#FDECC8', '#F2D08E']
          });
          updateSuccessDom(data);
        }, 5000)
        // 中奖页面去掉X 
        setCookie("subscript-success", true, 2, true);
        setCookie("subscript-success-data", JSON.stringify(data), 2, true);
         // 永久保留 30天数据
        setCookie("subscript-isSubscribe", true, 30, true);
        setCookie("subscript-success-activeFrom", subscribeActFrom.formActive.theme, 2, true);
        
      }
    })
  }
};

let lottery = [];
var activityId = '';
const subscriptPlug = $('#subscript-plug');
const ulikeSubscribe = $('.ulike-subscribe');

// 活动公共对象
const subscribeObj = {
  name: '',
  userEmail: '',
  phoneNumber: '',
  activityId: '',
  utmSource: '',
  extend: {
    utm_source: ''
  },
  isMarketing: false
};
var _formActive = {};
// 当前页面
var pathname = window.location.origin + location.pathname;

let languageMessageDtoList = {};

$(function () {
  turntable.light = $('#turntable_light')[0];
  turntable.bg = $('#turntable_bg')[0];
  turntable.gift = $('#turntable_gift')[0];

  let subscripSuccessData = getCookie("subscript-success-data");
  let _subscribeActFrom = getCookie('subscript-success-activeFrom');
  if (!getCookie("subscript-success") || subscripSuccessData == "" || _subscribeActFrom == "") {
    // 获取活动配置信息
    getActiveConfig();
  } else if (subscripSuccessData) {
    subscripSuccessData = JSON.parse(subscripSuccessData)
    // 直接渲染类型活动奖品
    // subscribeActFrom = JSON.parse(_subscribeActFrom);
    $(subscriptPlug).find('.success-popup .title').text(subscripSuccessData.winning_title);
    $(subscriptPlug).find('.success-popup .desc').text(subscripSuccessData.winning_sub_title);
    $(subscriptPlug).find('.subscription-popup').hide();
    updateSuccessDom(subscripSuccessData);
  }

  //  下一步
  $(document).on('click', "#subscript-plug .btn-wrap", function (e) {
    // 进入输入邮箱的界面；
    $('#subscript-plug .step-one').hide();
    $('#subscript-plug .setp-two').show();
    // 更换移动端文案；
    $(subscriptPlug).find('.m-box-head .title').text(languageMessageDtoList.participate_main_title);
    $(subscriptPlug).find('.m-box-head .desc').text(languageMessageDtoList.participate_sub_title);
    commonGtmEvent('首页Spin按钮', 'subscriptPlug', '');
  });

  $('.dropdown-selected').click(function () {
    $('.dropdown-menu').toggle(); // 显示或隐藏菜单
  });

  $(document).on('click', '.dropdown-menu li', function () {
    var code = $(this).data('code');
    var chosen = $(this).data('chosen');
    $('.dropdown-selected .country-code').text(code);
    $('.dropdown-selected .flag-icon').attr('data-chosen', chosen);
    $('.dropdown-menu').hide();
  });

  // 抽奖
  $(document).on('click', "#subscript-plug .spin-it", function (e) {
    commonGtmEvent('参与页订阅按钮', 'subscriptPlug', '');

    $('#subscript-plug .msg').hide().find('span').text('');
    $(this).prop("disabled", true);

    const urlParams = new URLSearchParams(window.location.search);
    let utm_source = urlParams.get("utm_source");
    subscribeObj.utmSource = utm_source;

    // 进入输入邮箱的界面；
    subscribeObj.userEmail = $('#subscript-plug  .j_user_email').val();
    if (subscribeObj.userEmail == '') {
      $(this).prop("disabled", false);
      $('#subscript-plug .msg').show().find('span').text(subscriptCopywriting.email_err);
      $(subscriptPlug).find('.input-email').addClass('error');
      // {{ 'general.page.text1' | t }}
      return;
    }
    if (!validateEmail(subscribeObj.userEmail)) {
      $(this).prop("disabled", false);
      $('#subscript-plug .msg').show().find('span').text(languageMessageDtoList.participate_email_err);
      $(subscriptPlug).find('.input-email').addClass('error');
      // $(subscriptPlug).find('.j_user_email').focus();
      return;
    }

    if (!subscribeObj.isMarketing && languageMessageDtoList.participate_receive_text.trim() != '') {
      $('#subscript-plug .msg').show().find('span').text(subscriptCopywriting.privacy_policy_err);
      $(this).prop("disabled", false);
      return false;
    }

    // 手机号码数据拼接
    if (_formActive.is_mobile == '1') {
      let countryCode = $('.box-phone .dropdown .country-code').text();
      // 手机号码格式验证
      let phone = $('#subscript-plug  .input-phone').val();
      if (!validatePhoneNumber(phone)) {
        $(this).prop("disabled", false);
        $('#subscript-plug .msg').show().find('span').text(languageMessageDtoList.participate_phone_err);
        return;
      }
      subscribeObj.phoneNumber = countryCode + '-' + phone;
    }


    // 新增彩带功能；
    // 抽奖
    sendApiRequest("/promotion/sendBenefit", subscribeObj).then(res => {
      if (res.code == 0) {
        // 隐藏抽奖前面奖品图片
        if(isMobile()){
          subscriptPlug.find('.spin-popup .slide-left').css('top', '-120px');
          subscriptPlug.find('.subscription-popup').css({ 'top': '60%' })
        }else {
          subscriptPlug.find('.spin-popup .slide-left').css('top', '-110px');
        }
        subscriptPlug.find('.spin-popup .slide-right').hide();
        subscriptPlug.find('.subscription-popup').removeClass('spin-popup');

        let data = res.data;
        turntable.gameStart(data);
        // 启动抽奖按钮
      } else if (res.code == 99998) {
        $('#subscript-plug .msg').show().find('span').text(languageMessageDtoList[res.message]);
        $(this).prop("disabled", false);
      } else {
        $('#subscript-plug .msg').show().find('span').text(subscriptCopywriting.system_err);
        $(this).prop("disabled", false);
      }
    }).catch(err => {
      $(this).prop("disabled", false);
      reject(err)
    })
  });

  // 多选框
  $(document).on('click', "#subscript-plug .setp-two .box-receive", function (e) {
    // 进入输入邮箱的界面
    if (!$('#policy-checkbox').prop('checked')) {
      subscribeObj.isMarketing = true;
      $('#policy-checkbox').prop('checked', true);
    } else {
      subscribeObj.isMarketing = false;
      $('#policy-checkbox').prop('checked', false);
    }
  });

  // 点击转盘抽奖
  $(document).on('click', "#subscript-plug #turntable_pointer", function (e) {
    // 进入输入邮箱的界面；
    if ($('#subscript-plug .setp-two').is(":visible")) {
      $('#subscript-plug .spin-it').click();
      commonGtmEvent('参与页中心点击', 'subscriptPlug', '');
    } else {
      $('#subscript-plug .step-one').hide();
      $('#subscript-plug .setp-two').show();
      $(subscriptPlug).find('.m-box-head .title').text(languageMessageDtoList.participate_main_title);
      $(subscriptPlug).find('.m-box-head .desc').text(languageMessageDtoList.participate_sub_title);
      commonGtmEvent('参与页中心点击', 'subscriptPlug', '');
    }
  });

  $(document).on('click', ".teaser-app .teaser-image", function (e) {
    toggleApp();
    commonGtmEvent('Teaser打开', 'subscriptPlug', '');
  });

  // 关闭弹出框
  $(document).on('click', "#subscript-plug .close", function (e) {
    var closeNum = getCookie('subscript-plug-close') || 0;
    toggleAppClose();
    if (Number(closeNum) < 2) {
      closeNum++;
      setCookie('subscript-plug-close', closeNum);
    } else if (getCookie('subscript-success') == '' || !getCookie('subscript-success')) {
      //  显示关闭按钮
      $('.teaser-app .close').show()
    }
    commonGtmEvent('参与页关闭按钮', 'subscriptPlug', '');
  });

  // 添加购物车
  $(document).on('click', "#subscript-plug .subscript-btn-add-cart", function (e) {
    let id = $(this).attr('pid');
    let code = $(this).attr('code');
    // 如果URL存在，则跳转到该URL
    if (id) {
      commonGtmEvent('完成页加车按钮', 'subscriptPlug', '');
      addToCart(id);
    }
    setTimeout(function () {
      addtoCartTag(subscribeObj.userEmail);
      if (code !== '') {
        autoDiscountCode(code);
      }
      toggleAppClose();
    }, 2000);
  });

  // 关闭teas弹出框
  $(document).on('click', ".teaser-app .close", function (e) {
    ulikeSubscribe.hide();
    $('.teaser-app').remove();
    commonGtmEvent('Teaser关闭', 'subscriptPlug', '');
  });

  // input 监听事件
  $('#subscript-plug .j_user_email').on('input', function () {
    var $this = $(this);
    if ($this.val().trim() !== '') {
      $this.closest('.input-email').removeClass('error');
    }
  });
});

/**
 * 获取活动配置
 */
function getActiveConfig() {
  // 初次访问
  setCookie('subscript-First-Visit', subscribeActFrom.resourceId, 2);
  // 设置中奖名单数据
  getBenefitList(subscribeActFrom.resourceId);
  // 更新订阅对象的活动ID
  subscribeObj.activityId = subscribeActFrom.resourceId;
  formatActiveData();
  // 设置cookie，表示活动已关闭
  setCookie('subscript-plug-close', 0);
}

/**
 * 获取当前活动信息
 * @param {Array} data - 活动数据数组，每个元素包含活动详情及创建时间等信息
 * @returns {Object} 当前活动对象，包含活动的详细信息
 */
function getCurrentActivity(data) {
  var currentData = data[0];
  const firstVisit = getCookie('subscript-First-Visit');
  // 是否2天内参加活动过
  if (firstVisit) {
    result = data.find(item => item.resourceId === firstVisit);
    if (result) {
      return result;
    }
  }

  // 判断是否为多活动状态
  if (data.length > 1) {
    // 初始化活动数据数组
    var actData = [];

    // 遍历活动数据
    for (let index = 0; index < data.length; index++) {
      const ths = data[index];
      let actIndex = -1;
      var _formActive = reverseTransform(ths.targetPluginDtoList);
      var hideContent = false;

      // 判断当前页面是否隐藏内容
      _formActive.urlViewArr.forEach(function (item) {
        if (pathname.indexOf(item.url) > -1 && pathname.length == item.url.length) {
          hideContent = true;
        }
      });

      // 计算当前活动的索引
      if (_formActive.radioView == 0 ||
        (_formActive.radioView == 1 && hideContent) ||
        (_formActive.radioView == 2 && !hideContent)) {
        actIndex = index;
      }

      // 将活动信息加入活动数据数组
      actData.push({
        createTime: ths.createTime,
        radioView: _formActive.radioView,
        actIndex: actIndex
      });
    }

    // 根据创建时间对活动数据数组进行排序
    actData.sort((a, b) => parseInt(a.createTime) - parseInt(b.createTime));

    // 寻找符合条件的当前活动
    let result = actData.find(item => item.radioView === "1" && item.actIndex !== -1);

    // 如果没有找到符合条件的活动，则寻找radioView为0的活动
    if (!result) {
      result = actData.find(item => item.radioView === "0");
    }

    // 如果找到了符合条件的活动，则设置当前活动数据
    if (result) {
      return data[result.actIndex];
    } else {
      console.error("没有符合条件的对象");
    }
  }

  return currentData
}


function formatActiveData() {
  turntable.targetId = subscribeActFrom.currentData.targetId;
  lottery = [];
  // 获取奖品数据;

  _formActive = subscribeActFrom.formActive;
  languageMessageDtoList = subscribeActFrom.languageMessData
  activityItem = subscribeActFrom.currentData.resourceObject.activityItemDtoList;

  for (var i = 0; i < activityItem.length; i++) {
    let _obj = activityItem[i];
    lottery.push({
      location: i,
      title: _obj.itemName,
      url: _obj.extend.prizeUrl,
      itemType: _obj.itemType,
      bgColor: _formActive.turntable_prize_arr[i].bg_color,
      bg2Color: _formActive.turntable_prize_arr[i].bg2_color,
      fontSize: _formActive.turntable_prize_arr[i].font_size,
      mfontSize: _formActive.turntable_prize_arr[i].m_font_size,
      fontColor: _formActive.turntable_prize_arr[i].font_color
    })
  }
  turntable.itemNum = lottery.length;
  // 解析颜色
  // 初始化文案
  $(subscriptPlug).find('.step-one .title').html(languageMessageDtoList.index_title).attr('title', languageMessageDtoList.index_title);
  $(subscriptPlug).find('.step-one .desc').html(languageMessageDtoList.index_sub_title).attr('title', languageMessageDtoList.index_sub_title);
  // $(subscriptPlug).find('.m-box-head .title').html(languageMessageDtoList.index_title).attr('title', languageMessageDtoList.index_title);
  // $(subscriptPlug).find('.m-box-head .desc').html(languageMessageDtoList.index_sub_title).attr('title', languageMessageDtoList.index_sub_title);

  // 图片资源
  $(subscriptPlug).find('.slide-left .abs-prize-pictures img').attr('data-src', _formActive.turntable_cover_url);
  $('.teaser-app').find('.teaser-image').attr('src', _formActive.turntable_teaser_url);
  $(subscriptPlug).find('.slide-left .pointer img').attr('data-src', _formActive.turntable_logo_url);


  // 描述
  var sub_desc = `<p>${languageMessageDtoList.index_sub_desc.replace(/\n/g, '</p><p>')}</p>`;
  $(subscriptPlug).find('.step-one .info').html(sub_desc);

  if (languageMessageDtoList.participate_receive_text.trim()) {
    $(subscriptPlug).find('.box-receive .text').text(languageMessageDtoList.participate_receive_text)
  } else {
    $(subscriptPlug).find('.box-receive').hide();
  }



  var _participate_desc = `<p>${languageMessageDtoList.participate_desc.replace(/\n/g, '</p><p>')}</p>`;
  $(subscriptPlug).find('.setp-two .box-marketing').html(_participate_desc)

  $(subscriptPlug).find('.setp-two .spin-it').text(languageMessageDtoList.btn_title);

  // 移动端文案；
  $(subscriptPlug).find('.m-box-head .title').text(languageMessageDtoList.index_title);
  $(subscriptPlug).find('.m-box-head .desc').text(languageMessageDtoList.index_sub_title);
  $(subscriptPlug).find('.slide-left .title').html(languageMessageDtoList.participate_main_title).attr('title', languageMessageDtoList.participate_main_title);
  

  $(subscriptPlug).find('.setp-two .title').html(languageMessageDtoList.participate_main_title).attr('title', languageMessageDtoList.participate_main_title);
  $(subscriptPlug).find('.setp-two .desc').html(languageMessageDtoList.participate_sub_title).attr('title', languageMessageDtoList.participate_sub_title);
  $(subscriptPlug).find('.setp-two .j_user_email').attr("placeholder", languageMessageDtoList.participate_email);
  $(subscriptPlug).find('.setp-two .input-phone').attr("placeholder", languageMessageDtoList.participate_phone);

  // 订阅功能
  $(subscriptPlug).find('.success-popup .title').text(languageMessageDtoList.winning_title);
  $(subscriptPlug).find('.success-popup .desc').text(languageMessageDtoList.winning_sub_title);
  $(subscriptPlug).find('.success-popup .expire').text(languageMessageDtoList.winning_code_title);

  // 箭头
  if (_formActive.turntable_arrow_url) {
    $(subscriptPlug).find('.abs-prize-arrow img').attr("data-src", _formActive.turntable_arrow_url);
  }

  // 背景色
  $(subscriptPlug).find('.turntable-wrap').css({
    "border-color": _formActive.turntable_bg_color,
    "box-shadow": "0 0 5px " + _formActive.turntable_bg_color
  })
  $(subscriptPlug).css({
    "--title-color": _formActive.turntable_font_color,
    "--turntable_font_color": _formActive.turntable_bg_color,
    "--turntable_btn_color": _formActive.turntable_btn_color,
    "--turntable_btnfont_color": _formActive.turntable_btnfont_color,
    "--success_font_color": _formActive.success_font_color,
    "--turntable_font_bg_color": _formActive.t_bg_font_color,
    "--turntable_bg_color": _formActive.t_bg_color
  });
  // 
  turntable.lottery = lottery;
  turntable.init();

  // 页面逻辑控制
  pageControl(_formActive);

  // 手机号码是否手机
  if (_formActive.is_mobile == '1') {
    // 初始化手机号码时间
    let selPhoneHtml = '';
    for (var i = 0; i < phoneList.length; i++) {
      let _ths = phoneList[i];
      let _html = ` <li data-code="${_ths.mcode}" data-chosen="${_ths.code}">
        ${_ths.key}
        <span class="flag-icon" data-chosen="${_ths.code}">
        </span>
      </li>`;
      selPhoneHtml += _html;
    }
    $('.dropdown-menu').html(selPhoneHtml);
    $('.box-phone').show();
  } else {
    $('.box-phone').hide();
  }
}


function pageControl(formActive) {
  // radioView 0 所有页面  1 指定页面显示  2 指定页面不展示
  var hideContent = false;
  // urlViewArr
  formActive.urlViewArr.forEach(function (item) {
    if (pathname.indexOf(item.url) > -1 && pathname.length == item.url.length) {
      hideContent = true;
    }
  });
  if (formActive.radioView == 0 ||
    (formActive.radioView == 1 && hideContent) ||
    (formActive.radioView == 2 && !hideContent)) {
    showSubscriptionPopup(formActive);
  }
  // 0 是 显示  1 不显示
  if (formActive.teaser == '0') {
    $('.teaser-app').fadeIn("slow");
  }

}


/**
 * 显示弹出框
 * @param {活动参数} formActive 
 */
function showSubscriptionPopup(formActive) {
  let visTime = 'visitor-times' + turntable.targetId;
  let visitorDay = 'visitor-day' + turntable.targetId;
  // max-visitor-times 访客最大次数
  // 用户进站后 秒弹出弹窗 text_in_show
  setTimeout(function () {
    // text_device 0 所有设备  1 pc  2 移动
    if ((formActive.text_device == '0') ||
      (!isMobile() && formActive.text_device == '1') ||
      (isMobile() && formActive.text_device == '2')) {
      let num = getCookie(visTime) ? parseInt(getCookie(visTime)) + 1 : 1;
      // 限制出现次数
      if (formActive.viewObj == '1' && parseInt(formActive.text_viewNum) >= num) {
        setCookie(visTime, num);
        commonGtmEvent('转盘展示次数', 'subscriptPlug', '');
   
        // 监听滚动事件
        window.addEventListener("scroll", triggerSubscription);
      } else if (formActive.viewObj == '2' && !Boolean(getCookie(visitorDay))) {
        setCookie(visitorDay, true, formActive.text_viewDay, true);
       
        window.addEventListener("scroll", triggerSubscription);
        commonGtmEvent('转盘展示次数', 'subscriptPlug', '');
      } else if (shouldDisplay()) {
        let today = getTodayDate(); // 格式化为 YYYY-MM-DD
        window.addEventListener("scroll", triggerSubscription);
        const displayData = JSON.parse(localStorage.getItem('subscript-displayData')) || { date: today, count: 0 };
        commonGtmEvent('订阅插件-皮肤1', `转盘${displayData.count}次访问弹出`, displayData.count);
      }
    }
  }, Number(formActive.text_in_show) * 1000);
}



function triggerSubscription() {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;

  if (scrollTop > 10) {
    addShowSubscript(); // 触发方法
    window.removeEventListener("scroll", triggerSubscription); // 确保只执行一次
  }
}


function addShowSubscript(){
  const today = getTodayDate();
  sessionStorage.setItem('subscript-sessionDisplayed', today);
  const displayData = JSON.parse(localStorage.getItem('subscript-displayData')) || { date: today, count: 0 };
  if (displayData.date !== today) {
    // 如果是新的一天，重置显示次数
    displayData.date = today;
    displayData.count = 0;
  }
  displayData.count++;
  localStorage.setItem('subscript-displayData', JSON.stringify(displayData));
  // 清除开场动画
  localStorage.removeItem('isOpenScratchPrize');
  toggleApp();
}

function shouldDisplay() {
  let today = getTodayDate(); // 格式化为 YYYY-MM-DD
  const sessionDisplayed = sessionStorage.getItem('subscript-sessionDisplayed');
  const displayData = JSON.parse(localStorage.getItem('subscript-displayData')) || { date: today, count: 0 };
  // 检查本次会话是否已经显示过
  if (sessionDisplayed === today) {
    return false;
  }
  // 如果是同一天，检查显示次数是否已达上限
  if (displayData.date === today && displayData.count >= 3) {
    return false;
  }
  return true;
}

/**
 * 将经过转换的数据恢复成原始格式。
 * @param {Array} transformedData 被转换的数据数组，其中每个元素包含name、type和value属性。
 * @returns {Object} 恢复后的数据对象。
 */
function reverseTransform(transformedData) {
  /**
   * 递归地将转换后的数据恢复成原始格式。
   * @param {Object} entry 转换后的数据项，包含name、type和value属性。
   * @returns {Object} 恢复后的数据项。
   */
  function restore(entry) {
    const { name, type, value } = entry;

    // 根据类型恢复原始数据
    if (type === 'array') {
      // 恢复数组类型的原始数据
      let arr = value.map(item => {
        // 递归恢复数组每个元素
        let simplifiedObject = {};
        item.value.forEach(innerItem => {
          // 恢复内层对象的原始数据
          simplifiedObject[innerItem.name] = innerItem.value;
        });
        return simplifiedObject;
      });
      return { name, value: arr };
    } else if (type === 'object') {
      // 恢复对象类型的原始数据
      return value.reduce((acc, item) => {
        const restored = restore(item); // 递归恢复对象属性
        acc[restored.name] = restored.value;
        return acc;
      }, {});
    } else {
      // 直接返回基本类型的原始数据
      return {
        name: name,
        value: value,
      };
    }
  }

  // 批量恢复转换后的数据数组，并整合成单一对象
  return transformedData.map(entry => {
    const restored = restore(entry);
    const result = {};
    if (restored !== undefined) {
      result[restored.name] = restored.value;
    }
    return result;
  }).reduce((acc, item) => Object.assign(acc, item), {});
}

/**
 * 发送API请求的函数
 * 
 * @param {string} url 请求的API地址
 * @param {Object} data 要发送的数据，格式为JSON对象
 * @param {Object} callbacks 回调函数对象，可包含success和error两个方法
 * @returns 无返回值
 */
function sendApiRequest(url, data) {
  data.siteCode = 'UK'; // Ensure the site code is set to 'UK'
  data.language = window.Shopify.locale;
  // Set up the AJAX settings
  var settings = {
    "url": api + url,
    "method": "POST", // POST is used as the request method
    "headers": {
      "Content-Type": "application/json", // Request payload is in JSON format
    },
    "data": JSON.stringify(data) // Convert data object to JSON string
  };

  // Return a new Promise
  return new Promise((resolve, reject) => {
    $.ajax(settings).done(function (response) {
      resolve(response); // Resolve the promise with the response
    }).fail(function (error) {
      console.error("Error during API call:", error); // Log the error
      reject(error); // Reject the promise with the error
    });
  });
}


/**
 * 获取中奖名单
 * @param {活动对象} data 
 */
function getBenefitList(activityId) {
  let param = {
    "pageNo": 1,
    "pageSize": 100,
    "includeCount": false,
    "activityId": activityId,
    "activityType": "SUBSCRIBE_ACTIVITY"
  }
  sendApiRequest('/promotion/queryBenefitInfoList', param).then((res) => {
    if (res.code == 0) {
      const data = res.data;
      if (data && data.length > 0) {
        let benefitHtml = '';
        for (let i = 0; i < data.length; i++) {
          let item = data[i];
          benefitHtml += `<li>${item.userEmail} won <span>${item.benefitName}</span></li>`
        }
        subscriptPlug.find('.scroll .list').html(benefitHtml);
        setInterval(function () {
          autoScroll('#subscript-plug .scroll');
        }, 3000);
      }
    }
  })
}


/**
 * 更新成功页面的DOM元素
 * @param {Object} data 包含活动名称和资源ID的数据对象
 * @param {string} data.benefitName 活动名称，可能包含"OFF"字符串
 * @param {string} data.resourceId 资源ID，显示在成功页面的右侧详情中
 */
function updateSuccessDom(data) {
  // 获取活动名称
  var actName = data.benefitName;
  subscribeObj.userEmail = data.userEmail;
  // 如果不包含"OFF"，直接将活动名称作为HTML字符串
  let nameHtml = `<span class="info">${actName}</span>`
  // 更新成功弹窗的右侧资源ID区域，并显示弹窗
  $('#subscript-plug .success-popup .left-code').html(nameHtml);
  // 处理实物的情况
  if (data.benefitType == 'GOODS_VIRTUAL') {
    $(subscriptPlug).find('.recommended-products').hide();
    let goodsHtml = `<img src="${data.prizeUrl}" /> <p class="tips">${data.winning_code_title}</p>`
    $(subscriptPlug).find('.success-popup .award-coupon').html(goodsHtml);

  } else {
    // 处理多商品折扣情况
    if (data.variantData) {
      $(subscriptPlug).find('.recommended-products .image-left img').attr('src', data.variantData.imageUrl);
      $(subscriptPlug).find('.recommended-products .product-right .name').html(data.variantData.productDto.title);
      $(subscriptPlug).find('.recommended-products .product-right .price').html(shopCurrencySymbol + data.variantData.price.amount);
      $(subscriptPlug).find('.recommended-products .product-right .subscript-btn-add-cart').attr('pid', data.variantData.variantId)
      $('#subscript-plug .success-popup .subscript-btn-add-cart').attr('code', data.resourceId);
      // 折扣名称
      $(subscriptPlug).find('.award-coupon .dispatch-coupon-txt').attr('data-text', actName);
      $(subscriptPlug).find('.award-coupon .dispatch-coupon-txt span').text(actName);
    } else {
      // 更新成功弹窗的左侧名称区域
      if (data.award_info) {
        $(subscriptPlug).find('.box-codes .right-detail').html(data.award_info)
      } else {
        $('#subscript-plug .success-popup .right-detail .text-code span').text(data.resourceId);
        $('#subscript-plug .success-popup .subscript-btn-add-cart').attr('code', data.resourceId);
      }
    }
  }
  setTimeout(function () {
    $(subscriptPlug).find('.subscription-popup').hide();
    $(subscriptPlug).find('.success-popup').show();
  }, 3000)
  // 设置中奖完成的图片，并隐藏抽奖弹窗，显示结果页面
  $('.teaser-image').attr('src', "https://cdn.shopify.com/s/files/1/0656/9079/6273/files/Frame_457393925.svg?v=1715667081");
  $('.teaser-app').show();
}

function addtoCartTag(email) {
  let data = {
    userEmail: email,
    userPhone: '',
    since: 'USER_SUBSCRIBE',
    tags: ['Spin-ATC'],
  };
  sendUlikeApi('/user/userSubscribe', data);
}

function validatePhoneNumber(number) {
  const regex = /^(\+|00)?[\d\s-]{0,4}?[\s-]?(\(?\d+\)?[\s-]?){1,6}\d+$/;
  return regex.test(number);
}

function validateEmail(email) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}


function autoScroll(obj) {
  gsap.to($(obj).find('.list'), {
    duration: 0.5,
    y: -25,
    onComplete: function () {
      // 将第一个元素移到列表的最后
      $(obj).find('.list').append($(obj).find('li:first'));

      // 重置 y 值，并清除 GSAP 的 inline 样式
      gsap.set($(obj).find('.list'), { y: 0 });
    },
  });
}


var originalPosition = {}; // 保存初始的 left 和 top 值

var app = $('#app'),
  init = $('#init'),
  zp = $('#zp'),
  button = $('button');
// 用于判断是否发生了拖拽
// let isDragging = false;

function toggleApp() {
  if (isOpen()) {
    $('.gift-box').hide();
    if (ulikeSubscribe.hasClass('small-circle')) {
      animateValue({
        start: 150,
        end: 0,
        duration: 600, // 动画时长为 600 毫秒
        onUpdate: (value) => {
          ulikeSubscribe.css('--clip-path', `${150 - value}%`);
          ulikeSubscribe.css('--origin-x', `${value}%`)
          ulikeSubscribe.css('--origin-y', `${value}%`)
        },
        onComplete: () => {
        }
      });
    }
    $('#subscript-plug').show();
    ulikeSubscribe.show();
  } else {
    ulikeSubscribe.show();
    setTimeout(function(){
      $('.gift-box').addClass('open-hz');
    }, 1000);
    $('.gift-box').show();
    setTimeout(function(){
      $('.gift-box').hide();
      $('#subscript-plug').fadeIn(10, () => {
        isOpen('isOpen');
       });
    }, 2000)
  };
}

function toggleAppClose() {
  const targetRect = $('.teaser-app')[0].getBoundingClientRect();
  const deltaX = targetRect.left + 20;
  const deltaY = targetRect.top + 20;
  ulikeSubscribe.find('.scratch-prize-close').fadeOut();
  ulikeSubscribe.css('--origin-x', `${deltaX}px`);
  ulikeSubscribe.css('--origin-y', `${deltaY}px`);
  ulikeSubscribe.addClass('small-circle');

  animateValue({
    start: 0,
    end: 150,
    duration: 600, // 动画时长为 2000 毫秒
    onUpdate: (value) => {
      // 你可以在这里更新元素的样式，例如：element.style.opacity = value;
      ulikeSubscribe.css('--clip-path', `${150 - value}%`);
    },
    onComplete: () => {
      ulikeSubscribe.hide();
      $('.teaser-app').show();
    }
  });
  
}


function animateValue({ start, end, duration, onUpdate, onComplete }) {
  const startTime = performance.now(); // 获取动画开始的时间
  function step(currentTime) {
    // 计算已经过去的时间
    const elapsedTime = currentTime - startTime;

    // 计算动画进度，限制在 [0, 1] 之间
    const progress = Math.min(elapsedTime / duration, 1);
    // 计算当前值
    const currentValue = start + (end - start) * progress;
    // 调用 onUpdate 回调，传入当前值
    onUpdate(currentValue);
    // 如果动画还未完成，继续下一帧
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      // 动画完成，调用 onComplete 回调（如果提供了）
      if (onComplete) onComplete();
    }
  }
  // 启动动画
  requestAnimationFrame(step);
}

// $(document).ready(function () {
//   function switchImage() {
//     $('#subscript-plug .box-light').toggle();
//   }
//   // 设置每隔一段时间切换图片
//   setInterval(switchImage, 500); // 每5秒切换一次
// });

function getTodayDate() {
  const today = new Date();
  return today.toISOString().split('T')[0]; // 格式化为 YYYY-MM-DD
}


// 监听盒子晃动动画结束
ulikeSubscribe.find('.gift-box-cont').on('animationend webkitAnimationEnd oAnimationEnd MSAnimationEnd', function() {
  $('.gift-box').addClass('open-hz');
});

// 监听盒子打开动画结束
ulikeSubscribe.find('.cp-hz').on('transitionend', () => {
  toggleApp();
});

function isOpen(param) {
  return true;
  // sessionStorage
  let isOpen = localStorage.getItem('isOpenScratchPrize');
  if (param) {
    localStorage.setItem('isOpenScratchPrize', param);
  }
  return isOpen;
}