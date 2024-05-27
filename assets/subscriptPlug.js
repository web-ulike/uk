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
        _clipPath = 'polygon(50% 50%,100% 50%,108% -50%)';
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
      $('<li>').css({
        'transform': `rotate(${deg}deg)`,
        'background-color': this.lottery[i].bgColor
      }).appendTo(this.bg);


      let giftItem = $('<li>').addClass('active').css(
        {
          'transform': `rotate(${ deg }deg)`,
          "color": this.lottery[i].fontColor,
          "font-size": this.lottery[i].fontSize + 'px'
        });
      let imgUrl = '';
      if (this.lottery[i].url) {
        imgUrl = `<img src="${this.lottery[i].url}" />`;
      }
      // 处理名称
      let prizeName = this.lottery[i].title;
      let nameHtml = '';
      if(prizeName.toLocaleUpperCase().indexOf('OFF') > -1){
        let _arr = prizeName.split(' ');
        nameHtml = `<div class="name">${_arr[0]}<span class="sub-name" style="font-size: ${this.lottery[i].fontSize}px;">${_arr[1]}</span></div>  `
      } else {
        nameHtml = `<span class="sub-name">${prizeName}</span>`
      }
      $(`<div class="prize-item">
            ${imgUrl}
            ${nameHtml}
          </div>`).appendTo(giftItem);
      $(this.gift).append(giftItem);
    }

    // 给点击抽奖按钮添加点击事件
    $(this.pointer).on('click', this.gameStart.bind(this));
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
    console.log(rotateItemDeg, rotate , rotateSpeed);
    setTimeout(function(){
      $('#turntable').css({
        'transform': `rotate(${rotate}deg)`,
        'transition': `transform ${rotateSpeed}s ease-out`
      });
    }, 10)
    // 3. 动画结束，显示中奖结果，中奖结果如何显示，视实际情况而定
    setTimeout(() => {
      this.isGoing = false;
      console.log('中奖结果：');
      $('.spin-popup').hide();
      var actName = data.benefitName;
      let nameHtml = '';
      if(actName.toLocaleUpperCase().indexOf('OFF') > -1){
        let _arr = actName.split(' ');
        nameHtml = `<div class="name">${_arr[0]}<span class="info">${_arr[1]}</span></div>  `
      } else {
        nameHtml = `<span class="info">${actName}</span>`
      }
      $('.success-popup .left-code').html(nameHtml);
      $('.success-popup .right-detail .code').text(data.resourceId);
      setCookie("discount_code", data.resourceId, 3);
      $('.success-popup').show();
      // 中奖完成操作
      $('.teaser-image').attr('src',  "https://cdn.shopify.com/s/files/1/0656/9079/6273/files/e8939a05899f202f1cefcf013a98f46e.svg?v=1715327502");
      // 中奖页面去掉X 
      setCookie("subscript-success", true, 2);

    }, rotateSpeed * 1600);
  }
};

let lottery = [
];


var activityId = '';
// 活动公共对象
const subscribeObj = {
  name: '',
  userEmail: '',
  phoneNumber: '',
  activityId: '',
  sourceCode: '',
  extend:{
    utm_source: ''
  },
  isMarketing: false
};
var _formActive = {};
// 当前页面
var pathname = window.location.origin + location.pathname;

let languageMessageDtoList = {};
const subscriptPlug = $('#subscript-plug');
$(function () {
  turntable.light = $('#turntable_light')[0];
  turntable.bg = $('#turntable_bg')[0];
  turntable.gift = $('#turntable_gift')[0];
  // turntable.pointer = $('#turntable_pointer');
  if(!getCookie('subscript-success')){
    getActiveConfig();
  }
  //  下一步
  $(document).on('click', "#subscript-plug .btn-wrap", function (e) {
    // 进入输入邮箱的界面；
    $('#subscript-plug .step-one').hide();
    $('#subscript-plug .setp-two').show();
    // 更换移动端文案；
    $(subscriptPlug).find('.slide-left .title').text(languageMessageDtoList.participate_main_title);
    $(subscriptPlug).find('.slide-left .desc').text(languageMessageDtoList.participate_sub_title);
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
    $('#subscript-plug .msg').text('');
    $(this).prop("disabled", true);

    const urlParams = new URLSearchParams(window.location.search);
    let utm_source = urlParams.get("utm_source");
    subscribeObj.extend.utm_source = utm_source;
    // 进入输入邮箱的界面；
    subscribeObj.userEmail = $('#subscript-plug  .j_user_email').val();
    if (!validateEmail(subscribeObj.userEmail)) {
      $(this).prop("disabled", false);
      $('#subscript-plug .msg').text(languageMessageDtoList.participate_email_err);
      return;
    }
    
    if (!subscribeObj.isMarketing && languageMessageDtoList.participate_receive_text.trim() != '') {
      $('#subscript-plug .msg').text('Please check the box to agree to the privacy policy');
      $(this).prop("disabled", false);
      return false;
    }

    // 手机号码数据拼接
    if(_formActive.is_mobile == '1'){
      let countryCode = $('.box-phone .dropdown .country-code').text();
      // 手机号码格式验证
      let phone = $('#subscript-plug  .input-phone').val();
      if (!validatePhoneNumber(phone)) {
        $(this).prop("disabled", false);
        $('#subscript-plug .msg').text(languageMessageDtoList.participate_phone_err);
        return;
      }
      subscribeObj.phoneNumber = countryCode + '-' + phone;
    }
    // 隐藏抽奖前面奖品图片
    $('.abs-prize-pictures').hide();

    // 抽奖
    sendApiRequest("/promotion/sendBenefit", subscribeObj).then(res => {
      if (res.code == 0) {
        let data = res.data;
        turntable.gameStart(data);
        // 启动抽奖按钮
      } else if (res.code == 99998) {
        $('#subscript-plug .msg').text(languageMessageDtoList[res.message]);
        $(this).prop("disabled", false);
      } else {
        $('#subscript-plug .msg').text('System exception, please try again later');
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

  // 关闭弹出框
  $(document).on('click', "#subscript-plug .close", function (e) {
    var closeNum = getCookie('subscript-plug-close') || 0;
    $('#subscript-plug').hide();
    if(Number(closeNum) < 2){
      closeNum++;
      setCookie('subscript-plug-close', closeNum);
    } else if(getCookie('subscript-success')){
      //  显示关闭按钮
      $('.teaser-app .close').show()
    }
  });

  $(document).on('click', "#subscript-plug .btn-add-cart", function (e) {
    let id = $(this).attr('pid');
    // 把折扣码放进去；
    // 如果URL存在，则跳转到该URL
    if (id) {
      addToCart(id);
    }
    $('#subscript-plug').hide();
  });
  // 打开弹出框
  $(document).on('click', ".teaser-app .teaser-image", function (e) {
    $('#subscript-plug').show();
  });
  $(document).on('click', ".teaser-app .close", function (e) {
    $('#subscript-plug').hide();
    $('.teaser-app').remove();
  });


});

/**
 * 获取活动配置
 */
function getActiveConfig() {
  let time = parseInt(new Date().getTime() / 1000);
  sendApiRequest('/promotion/queryTargetInfoList',
    {
      "targetStatus": "PUBLISH",
      "afterStartTime": time,
      "beforeEndTime": time,
      "targetType": "ACTIVITY",
      "resourceType": "SUBSCRIBE_ACTIVITY"
    }).then(res => {
      if (res.code == 0) {
        var data = res.data[0];
        formatActiveData(data);
        subscribeObj.activityId = data.resourceId;
      }
    }).catch(err => {
      console.log(err);
      reject(err)
    })
}



function formatActiveData(data) {
  turntable.targetId = data.targetId;
  lottery = [];
  // 获取奖品数据;
  var activityItem = data.resourceObject.activityItemDtoList;
  _formActive = reverseTransform(data.targetPluginDtoList);

  for (let index = 0; index < data.languageMessageDtoList.length; index++) {
    let _ths = data.languageMessageDtoList[index];
    languageMessageDtoList[_ths.key] = _ths.value;
  }

  for (var i = 0; i < activityItem.length; i++) {
    let _obj = activityItem[i];
    lottery.push({
      location: i,
      title: _obj.itemName,
      url: _obj.extend.prizeUrl,
      itemType: _obj.itemType,
      bgColor: _formActive.turntable_prize_arr[i].bg_color,
      fontSize: _formActive.turntable_prize_arr[i].font_size,
      fontColor: _formActive.turntable_prize_arr[i].font_color
    })
  }
  turntable.itemNum = lottery.length;
  // 解析颜色
  // 初始化文案
  console.log(languageMessageDtoList);
  $(subscriptPlug).find('.step-one .title').text(languageMessageDtoList.index_title).attr('title', languageMessageDtoList.index_title);
  $(subscriptPlug).find('.step-one .desc').text(languageMessageDtoList.index_sub_title).attr('title', languageMessageDtoList.index_sub_title);
  $(subscriptPlug).find('.step-one .title').text(languageMessageDtoList.index_title).attr('title', languageMessageDtoList.index_title);
  $(subscriptPlug).find('.step-one .desc').text(languageMessageDtoList.index_sub_title).attr('title', languageMessageDtoList.index_sub_title);
  
  // 图片资源
  $(subscriptPlug).find('.slide-left .abs-prize-pictures img').attr('src', _formActive.turntable_cover_url);
  $('.teaser-app').find('.teaser-image').attr('src', _formActive.turntable_teaser_url);
  

  // 描述
  var sub_desc = `<p>${languageMessageDtoList.index_sub_desc.replace(/\n/g, '</p><p>')}</p>`;
  $(subscriptPlug).find('.step-one .info').html(sub_desc);

  if(languageMessageDtoList.participate_receive_text.trim()){
    $(subscriptPlug).find('.box-receive .text').text(languageMessageDtoList.participate_receive_text)
  } else {
    $(subscriptPlug).find('.box-receive').hide();
  }
 


  var _participate_desc = `<p>${languageMessageDtoList.participate_desc.replace(/\n/g, '</p><p>')}</p>`;
  $(subscriptPlug).find('.setp-two .box-marketing').html(_participate_desc)

  $(subscriptPlug).find('.step-one .btn-wrap').text(languageMessageDtoList.btn_title);

  // 移动端文案；
  $(subscriptPlug).find('.slide-left .title').text(languageMessageDtoList.index_title);
  $(subscriptPlug).find('.slide-left .desc').text(languageMessageDtoList.index_sub_title);


  $(subscriptPlug).find('.setp-two .title').text(languageMessageDtoList.participate_main_title).attr('title', languageMessageDtoList.participate_main_title);
  $(subscriptPlug).find('.setp-two .desc').text(languageMessageDtoList.participate_sub_title).attr('title', languageMessageDtoList.participate_sub_title);
  $(subscriptPlug).find('.setp-two .j_user_email').attr("placeholder", languageMessageDtoList.participate_email);
  $(subscriptPlug).find('.setp-two .input-phone').attr("placeholder", languageMessageDtoList.participate_phone);

  $(subscriptPlug).find('.success-popup .title').text(languageMessageDtoList.winning_title);
  $(subscriptPlug).find('.success-popup .desc').text(languageMessageDtoList.winning_sub_title);
  $(subscriptPlug).find('.success-popup .expire').text(languageMessageDtoList.winning_code_title);

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
    "--success_font_color": _formActive.success_font_color
  });
  // 
  turntable.lottery = lottery;
  turntable.init();

  // 页面逻辑控制
  pageControl(_formActive);

  // 手机号码是否手机
  if(_formActive.is_mobile == '1'){
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
  }else {
    $('.box-phone').hide();
  }
}


function pageControl(formActive) {
  // radioView 0 所有页面  1 指定页面显示  2 指定页面不展示
  var hideContent = false;
  // urlViewArr
  formActive.urlViewArr.forEach(function (item) {
    console.log(pathname.indexOf(item.url));
    if (pathname.indexOf(item.url) > -1 && pathname.length == item.url.length) {
      hideContent = true;
    }
  });
  // if (!sessionStorage.getItem(turntable.targetId)) {
  //   // 将标识符写入 sessionStorage，以确保下次不再弹出
  //   sessionStorage.setItem(popupKey, "true");
  // }
  // console.log(hideContent, formActive.radioView);
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
  console.log(formActive.text_viewObj);
  let visTime = 'visitor-times' + turntable.targetId;
  let visitorDay = 'visitor-day' + turntable.targetId;
  // max-visitor-times 访客最大次数
  // 用户进站后 秒弹出弹窗 text_in_show
  setTimeout(function () {
    // if(formActive.){}
    // text_device 0 所有设备  1 pc  2 移动
    if ((formActive.text_device == '0') ||
      (!isMobile() && formActive.text_device == '1') ||
      (isMobile() && formActive.text_device == '2')) {
      let num = getCookie(visTime) ? parseInt(getCookie(visTime)) + 1 : 1;
      // 限制出现次数
      if (formActive.viewObj == '1' && parseInt(formActive.text_viewNum) >= num) {
        setCookie(visTime, num);
        $('#subscript-plug').fadeIn("slow");
      } else if (formActive.viewObj == '2' && !Boolean(visitorDay)) {
        setCookie(visitorDay, true, formActive.text_viewDay);
        $('#subscript-plug').fadeIn("slow");
      }
      setTimeout(function(){
        $('.turntable').removeClass('spin-start');
      }, 3000)

    }

  }, formActive.text_in_show)
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

  url = 'https://api.idsoy.com' + url;
  // Set up the AJAX settings
  var settings = {
    "url": url,
    "method": "POST", // POST is used as the request method
    "headers": {
      "Content-Type": "application/json", // Request payload is in JSON format
    },
    "data": JSON.stringify(data) // Convert data object to JSON string
  };

  // Return a new Promise
  return new Promise((resolve, reject) => {
    $.ajax(settings).done(function (response) {
      console.log("Response:", response); // Log the response
      resolve(response); // Resolve the promise with the response
    }).fail(function (error) {
      console.error("Error during API call:", error); // Log the error
      reject(error); // Reject the promise with the error
    });
  });
}


function validatePhoneNumber(number) {
  const regex = /^(\+|00)?[\d\s-]{0,4}?[\s-]?(\(?\d+\)?[\s-]?){1,6}\d+$/;
  return regex.test(number);
}

function validateEmail(email) {
  const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return regex.test(email);
}
