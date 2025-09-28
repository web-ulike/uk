class Wheel {
  constructor(subscribeModule) {
    this.pathname = window.location.origin + location.pathname;
    this.list = [];
    this.isLoginStatusData = {
      status: false,
      email: ''
    }
    this.$p = document.querySelector(subscribeModule);
    this.main = this.$p.querySelector(".tray-main");
    this.temp = this.$p.querySelector(".tray-part");
    this.box = this.$p.querySelector(".tray");
    this.subscribeModuleCheckbox = document.getElementById('green-subscribe-module-checkbox');
    // this.subscribeJumpCheckbox = document.getElementById('subscribe-jump-checkbox');
    this.rotate = 0;
    this.isRunning = false;
    this.perAngle = 45;
    this.rotates = 0;
    this.mathDeg = 30;
    this.isShow = false;
    this.getLoginStatus = false
    this.subscripSuccessData = "";
    this.shopCurrencySymbol = "$";
    // this.api = "http://api.test.myulike.com";//测试环境接口
    this.api = "https://api.ulike.com";//生产环境接口
    this.managementSystemUrl ="https://account.ulike.com"
    // 活动存储对象
    this.subscribeActFrom = {
      resourceId: "",
      sourceCode: "",
      activityItem: "",
      currentData: "",
      colorItem: [],
      languageMessData: "",
      formActive: {
        theme: 0,
      },
    };

    this.subscribeObj = {
      name: "",
      userEmail: "",
      password: "",
      phoneNumber: "",
      activityId: "",
      utmSource: "",
      extend: {
        utm_source: "",
      },
      isMarketing: false,
    };

    this.color = [
      {
        color:
          "linear-gradient(180deg, #F0EBFF 0.13%, rgba(255, 255, 255, 1.00) 72.68%)",
      },
      {
        color:
          "linear-gradient(235deg, rgba(224, 0, 77, 1.00) 23.06%, #FF7DAA 92.89%)",
      },
      {
        color:
          "linear-gradient(180deg, #F0EBFF 0.13%, rgba(255, 255, 255, 1.00) 72.68%)",
      },
      {
        color:
          "linear-gradient(260deg, rgba(224, 0, 77, 1.00) -1.58%, #FF7DAA 74.91%)",
      }
    ];
    this.getInitData();
  }

  getInitData() {
    this.subscripSuccessData = localStorage.getItem('green-rotation-subscript-success-data') ? JSON.parse(localStorage.getItem('green-rotation-subscript-success-data')) : '';
    let green_subscript_success = this.getCookie("green-rotation-subscript-success");
    this.getActiveInitConfig();

    if (green_subscript_success && this.subscripSuccessData) {
      // 更新中奖数据
      this.$p.classList.add("dispatch-cont");
      this.updateSuccessDom(this.subscripSuccessData);
      this.fadeIn(document.querySelector('.green-subscribe-teaser-app'))
    }
    $('.green-subscribe-teaser-app').show().find('.teaser-image').attr("src", "https://cdn.shopify.com/s/files/1/0740/5882/6015/files/20250523-102145.gif?v=1747967045");
    this.init();
  }

  // 获取中奖用户列表
  getBenefitInfoList() {
    this.sendApiRequest("/promotion/queryBenefitInfoList", {
      activityId: this.subscribeObj.activityId,
      activityType: "SUBSCRIBE_ACTIVITY",
      includeCount: false,
      language: "en",
      pageNo: 1,
      pageSize: 100,
    })
      .then((res) => {
        if (res.code == 0 && res.data && res.data.length > 0) {
          res.data.forEach((item) => {
            this.$p.querySelector(".green-subscribe-module-slide-list").innerHTML += `
                  <div class="green-subscribe-module-slide-item">${item.userEmail} won <span>${item.benefitName}</span></div>`;
          });
          this.fadeIn(this.$p.querySelector('.green-subscribe-module-slide'))
          this.verticalCarousel();
        } else {
          this.$p.querySelector(".green-subscribe-module-slide").style.display =
            "none";
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }

  /**
   * 获取活动配置
   */
  getActiveInitConfig() {
    let time = parseInt(new Date().getTime() / 1000);
    this.sendApiRequest("/promotion/queryTargetInfoList", {
      targetStatus: "PUBLISH",
      afterStartTime: time,
      beforeEndTime: time,
      targetType: "ACTIVITY",
      resourceType: "SUBSCRIBE_ACTIVITY",
    })
      .then((res) => {
        if (res.code == 0 && res.data.length > 0) {
          // 判断是否多活动属性
          const currentData = this.getCurrentActivity(res.data);
          // 初次访问
          setCookie('green-subscript-First-Visit', currentData.resourceId, 2);
          this.formatActiveData(currentData);
          delete currentData.languageMessageDtoList;
          delete currentData.targetPluginDtoList;
          this.subscribeActFrom.currentData = currentData;
          this.subscribeActFrom.resourceId = currentData.resourceId;
          this.subscribeObj.activityId = this.subscribeActFrom.resourceId;

          this.list = [
            ...this.subscribeActFrom.currentData.resourceObject.activityItemDtoList.filter(item => item.itemType === "COUPON").slice(0, 2), // 第一个 COUPON
            ...this.subscribeActFrom.currentData.resourceObject.activityItemDtoList.filter(item => item.itemType === "GOODS_VIRTUAL"),      // 所有 GOODS_VIRTUAL
          ];
          console.log('存储', this.list);

          localStorage.setItem('subscrip-list-data', JSON.stringify(this.list));
          this.perAngle = 360 / this.list.length;
          // this.getBenefitInfoList();
          // 页面逻辑控制
          this.pageControl(this.subscribeActFrom.formActive);
          this.render();
          this.domOnUpdate();
        }
      })
      .catch((err) => {
        console.log(err);
        reject(err);
      });
  }

  /**
   * 获取当前活动信息
   * @param {Array} data - 活动数据数组，每个元素包含活动详情及创建时间等信息
   * @returns {Object} 当前活动对象，包含活动的详细信息
   */
  getCurrentActivity(data) {
    const firstVisit = this.getCookie("green-subscript-First-Visit");
    console.log("resourceId", data);
    // // 是否2天内参加活动过
    // if (firstVisit) {
    //   let result = data.find((item) => item.resourceId === firstVisit);
    //   if (result) {
    //     return result;
    //   }
    // }
    // let currentData = data[0];
    // // 判断是否为多活动状态
    // if (data.length > 1) {
    //   // 初始化活动数据数组
    //   let actData = [];

    //   // 遍历活动数据
    //   for (let index = 0; index < data.length; index++) {
    //     const ths = data[index];
    //     let actIndex = -1;
    //     let _formActive = this.reverseTransform(ths.targetPluginDtoList);
    //     let hideContent = false;

    //     _formActive.urlViewArr.push({ url: 'https://dmfywhbhkt5zwe2s-74058826015.shopifypreview.com' })

    //     // 判断当前页面是否隐藏内容
    //     _formActive.urlViewArr.forEach((item) => {
    //       if (
    //         this.pathname.indexOf(item.url) > -1 &&
    //         this.pathname.length == item.url.length
    //       ) {
    //         hideContent = true;
    //       }
    //     });

    //     // 计算当前活动的索引
    //     if (
    //       _formActive.radioView == 0 ||
    //       (_formActive.radioView == 1 && hideContent) ||
    //       (_formActive.radioView == 2 && !hideContent)
    //     ) {
    //       actIndex = index;
    //     }

    //     // 将活动信息加入活动数据数组
    //     actData.push({
    //       createTime: ths.createTime,
    //       radioView: _formActive.radioView,
    //       actIndex: actIndex,
    //     });
    //   }

    //   // 根据创建时间对活动数据数组进行排序
    //   actData.sort((a, b) => parseInt(a.createTime) - parseInt(b.createTime));

    //   // 寻找符合条件的当前活动
    //   let result = actData.find(
    //     (item) => item.radioView === "1" && item.actIndex !== -1
    //   );

    //   // 如果没有找到符合条件的活动，则寻找radioView为0的活动
    //   if (!result) {
    //     result = actData.find((item) => item.radioView === "0");
    //   }

    //   // 如果找到了符合条件的活动，则设置当前活动数据
    //   if (result) {
    //     return data[result.actIndex];
    //   } else {
    //     console.error("没有符合条件的对象");
    //     this.fadeOut(document.querySelector('.green-subscribe-teaser-app'))
    //   }
    // }
    //暂时固定ID
    let currentData
    data.forEach((item=>{
      if (item.targetId == "163456047996993536") {
        currentData=item
      }
    }))
    return currentData;
  }

  // 格式化活动数据
  formatActiveData(data) {
    let languageMessageDtoList = {};
    // 获取奖品数据;
    let _activityItem = data.resourceObject.activityItemDtoList;
    this.subscribeActFrom.formActive = this.reverseTransform(
      data.targetPluginDtoList
    );
    let activityItem = [];
    for (let i = 0; i < _activityItem.length; i++) {
      let _obj = _activityItem[i];
      activityItem.push({
        location: i,
        title: _obj.itemName,
        url: _obj.extend.prizeUrl || "",
        itemType: _obj.itemType,
        bgColor:
          this.subscribeActFrom.formActive.turntable_prize_arr[i].bg_color,
        bg2Color:
          this.subscribeActFrom.formActive.turntable_prize_arr[i].bg2_color,
        fontSize:
          this.subscribeActFrom.formActive.turntable_prize_arr[i].font_size,
        mfontSize:
          this.subscribeActFrom.formActive.turntable_prize_arr[i].m_font_size,
        fontColor:
          this.subscribeActFrom.formActive.turntable_prize_arr[i].font_color,
        price: _obj.extend.disProductPrice,
      });
      this.subscribeActFrom.colorItem.push([
        this.subscribeActFrom.formActive.turntable_prize_arr[i].bg_color,
        this.subscribeActFrom.formActive.turntable_prize_arr[i].bg2_color,
      ]);
    }

    this.subscribeActFrom.activityItem = activityItem;

    for (let index = 0; index < data.languageMessageDtoList.length; index++) {
      let _ths = data.languageMessageDtoList[index];
      languageMessageDtoList[_ths.key] = _ths.value;
    }
    this.subscribeActFrom.languageMessData = languageMessageDtoList;
  }
  // 根据当前页面判断是否显示转盘
  pageControl(formActive) {
    // radioView 0 所有页面  1 指定页面显示  2 指定页面不展示
    let hideContent = false;
    // urlViewArr
    formActive.urlViewArr.forEach((item) => {
      if (
        this.pathname.indexOf(item.url) > -1 &&
        this.pathname.length == item.url.length
      ) {
        hideContent = true;
      }
    });
    this.showSubscriptionPopup(formActive);
    // if (
    //   formActive.radioView == 0 ||
    //   (formActive.radioView == 1 && hideContent) ||
    //   (formActive.radioView == 2 && !hideContent)
    // ) {
    //   // 自动显示弹窗
    //   this.showSubscriptionPopup(formActive);
    // }
    // 是否显示转盘点击弹窗按钮 0 是 显示  1 不显示
    if (formActive.teaser == "0") {
      this.fadeIn(document.querySelector('.green-subscribe-teaser-app'))
    }
  }

  /**
   * 将经过转换的数据恢复成原始格式。
   * @param {Array} transformedData 被转换的数据数组，其中每个元素包含name、type和value属性。
   * @returns {Object} 恢复后的数据对象。
   */
  reverseTransform(transformedData) {
    /**
     * 递归地将转换后的数据恢复成原始格式。
     * @param {Object} entry 转换后的数据项，包含name、type和value属性。
     * @returns {Object} 恢复后的数据项。
     */
    function restore(entry) {
      const { name, type, value } = entry;

      // 根据类型恢复原始数据
      if (type === "array") {
        // 恢复数组类型的原始数据
        let arr = value.map((item) => {
          // 递归恢复数组每个元素
          let simplifiedObject = {};
          item.value.forEach((innerItem) => {
            // 恢复内层对象的原始数据
            simplifiedObject[innerItem.name] = innerItem.value;
          });
          return simplifiedObject;
        });
        return { name, value: arr };
      } else if (type === "object") {
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
    return transformedData
      .map((entry) => {
        const restored = restore(entry);
        const result = {};
        if (restored !== undefined) {
          result[restored.name] = restored.value;
        }
        return result;
      })
      .reduce((acc, item) => Object.assign(acc, item), {});
  }
  /**
   * 自动显示弹出框
   * @param {活动参数} formActive
   */
  showSubscriptionPopup(formActive) {
    let visTime = "visitor-times" + this.subscribeActFrom.resourceId;
    let visitorDay = "visitor-day" + this.subscribeActFrom.resourceId;
    let today = this.getTodayDate();
    // max-visitor-times 访客最大次数
    // 用户进站后 秒弹出弹窗 text_in_show
    setTimeout(() => {
      // text_device 0 所有设备  1 pc  2 移动
      // console.log('formActive', formActive);
      if (
        formActive.text_device == "0" ||
        (!isMobile() && formActive.text_device == "1") ||
        (isMobile() && formActive.text_device == "2")
      ) {
        let num = this.getCookie(visTime)
          ? parseInt(this.getCookie(visTime)) + 1
          : 1;
        // 限制出现次数
        if (
          formActive.viewObj == "1" &&
          parseInt(formActive.text_viewNum) >= num
        ) {
          this.setCookie(visTime, num);
          // window.addEventListener("scroll", this.triggerSubscription());
          this.triggerSubscription()
        } else if (
          formActive.viewObj == "2" &&
          !Boolean(this.getCookie(visitorDay))
        ) {
          this.setCookie(visitorDay, true, formActive.text_viewDay, true);
          // window.addEventListener("scroll", this.triggerSubscription());
          this.triggerSubscription()
        } else if (this.shouldDisplay()) {
          // ulikeOpenSubscribe();
           // 监听滚动事件
          window.addEventListener("scroll", this.triggerSubscription());
          const displayData = JSON.parse(
            localStorage.getItem("subscript-displayData")
          ) || { date: today, count: 0 };
        } else {
          // 不显示
          console.log("不显示");
          // ulikeOpenSubscribe();//前置全部打开
        }
      }
    }, Number(formActive.text_in_show) * 1000);
  }

  triggerSubscription() {
    this.showSubscript(); 
    // const scrollTop = window.scrollY || document.documentElement.scrollTop;

    // if (scrollTop > 0) {
    //   this.showSubscript(); // 触发方法
    //   window.removeEventListener("scroll", this.triggerSubscription()); // 确保只执行一次
    // }
  }

  showSubscript() {
    const today = this.getTodayDate();
    sessionStorage.setItem('subscript-sessionDisplayed', today);
    const displayData = JSON.parse(localStorage.getItem('subscript-displayData')) || { date: today, count: 0 };
    if (displayData.date !== today) {
      // 如果是新的一天，重置显示次数
      displayData.date = today;
      displayData.count = 0;
    }
    displayData.count++;
    localStorage.setItem('subscript-displayData', JSON.stringify(displayData));
    this.open();
  }

  shouldDisplay() {
    let today = this.getTodayDate(); // 格式化为 YYYY-MM-DD
    const sessionDisplayed = sessionStorage.getItem(
      "subscript-sessionDisplayed"
    );
    const displayData = JSON.parse(
      localStorage.getItem("subscript-displayData")
    ) || { date: today, count: 0 };
    // 检查本次会话是否已经显示过
    if (sessionDisplayed === today) {
      return false;
    }
    let maxCount = Number(this.subscribeActFrom.formActive.text_viewDayNum);
    // 如果是同一天，检查显示次数是否已达上限
    if (displayData.date === today && displayData.count >= maxCount) {
      return false;
    }
    return true;
  }

  getTodayDate() {
    const today = new Date();
    return today.toISOString().split("T")[0]; // 格式化为 YYYY-MM-DD
  }
  //旋转之前是否勾选
  isModulCheck() {
    const isModuleChecked = this.subscribeModuleCheckbox.classList.contains('checked');
    if (!isModuleChecked) {
      $('.module-checkmark').fadeIn()
      return false;
      throw new Error("Please agree to our privacy policy");
      // return false;
    } else {
      $('.module-checkmark').fadeOut()
      return true;
    }
  }
  // 查看更多时是否勾选
  // isJumpCheck() {
  //   const isJumpChecked = this.subscribeJumpCheckbox.classList.contains('jumpChecked');
  //   if (!isJumpChecked) {
  //     $('.module-checkmark').fadeIn()
  //     throw new Error("Please check");
  //   } else {
  //     $('.module-checkmark').fadeOut()
  //   }
  // }
  // 获取完数据后初始化抽奖盘
  async init() {
    // 获取登录用户账号状态
    this.sendApiRequest('/user/queryLoginUserAccount', {}).then((res) => {
      if (res.data.userId) {
        this.isLoginStatusData.status = true
        this.isLoginStatusData.email = res.data.userEmail

      } else {
        this.isLoginStatusData.status = false
        this.isLoginStatusData.email = ''
      }

    }).catch(() => {

    });
    this.main.addEventListener("transitionend", () => this.end());
    let that = this;

    // 监听点击事件
    this.$p.addEventListener("click", async (e) => {
      let target = e.target;
      // 点击提交邮箱或转盘抽奖
      const subscribeModuleBtn = target.closest(".green-subscribe-module-btn");
      const clickRotatePrize = target.closest(".click-rotate-prize");
      if(subscribeModuleBtn){
        commonGtmEvent('vip_subscribe', '邮箱提交按钮', '');
      }
      if(clickRotatePrize){
        commonGtmEvent('vip_click_clover', '点击叶子区域', '');
      }
      if (subscribeModuleBtn || clickRotatePrize) {
       
       
        // 创建一个URLSearchParams对象，用于获取URL中的查询参数
        const urlParams = new URLSearchParams(window.location.search);

        // 尝试从查询参数中获取utm_source的值，用于追踪营销活动的来源
        let utm_source = urlParams.get("utm_source");

        // 将获取到的utm_source值存储到subscribeObj对象中，以便后续使用
        this.subscribeObj.utmSource = utm_source;
        // 从页面上的订阅插件中获取用户输入的邮箱地址
        this.subscribeObj.userEmail = this.$p
          .querySelector(".green-subscribe-module-input")
          .value.trim();
        if (!this.subscribeObj.userEmail) {
          this.$p
            .querySelector(".green-subscribe-module-from")
            .classList.add("report-cont");
          this.$p.querySelector(".green-subscribe-module-inp-msg .text").innerHTML =
            'Please enter your email to participate';
          this.fadeIn(this.$p.querySelector(".green-subscribe-module-inp-msg"));
          return;
        }
        if (!this.validateEmail(this.subscribeObj.userEmail)) {
          this.$p
            .querySelector(".green-subscribe-module-from")
            .classList.add("report-cont");
          this.$p.querySelector(".green-subscribe-module-inp-msg .text").innerHTML = 'Please enter a valid email address';
          this.fadeIn(this.$p.querySelector(".green-subscribe-module-inp-msg"));
          return;
        }
        // 如果勾选了政策就执行订阅
        if(this.isModulCheck()){
           this.getDispatch();
        }
      }

      // 点击关闭
      const subscribeModuleClose = target.closest(".green-subscribe-module-close");
      if (subscribeModuleClose) {
        this.closeScratch();
      }
      //点击Discover More
      const discovermorebtn = target.closest(".discover-more-btn");
      const discovermoreaccount = target.closest(".discover-more-account");

      // return

      if (discovermorebtn || discovermoreaccount) {
        // 获取数据
        this.subscripSuccessData = localStorage.getItem('green-rotation-subscript-success-data') ? JSON.parse(localStorage.getItem('green-rotation-subscript-success-data')) : '';
    
        console.log('this.subscripSuccessData', this.subscripSuccessData);
        // 根据按钮埋点
        if (discovermorebtn) {
          commonGtmEvent('vip_Check my benefits', 'Check my benefits按钮', '');
        }
        if (discovermoreaccount) {
          commonGtmEvent('vip_account check', 'Account按钮', '');
        }
        //判断当前用户是否已登录  状态
        console.log('this.isLoginStatusData', this.isLoginStatusData);
        // return


        //请求接口  判断输入邮箱是新用户还是老用户
        this.sendApiRequest('/user/preLogin', {
          scene: "LOTTERY_LOGIN",
          userEmail: this.subscripSuccessData.userEmail
        }).then((res) => {
          if (res.code != '0' || !res.data) return
          // 已登录 使用当前邮箱参与活动 抽奖成功后点击按钮 跳转到个人中心页面
          if (this.isLoginStatusData.status && this.isLoginStatusData.email == this.subscripSuccessData.userEmail) {
            window.location.href = this.managementSystemUrl+ '/account/rewards?site=uk';
            return
          }
          //已登录  使用老邮箱参与活动
          if (this.isLoginStatusData.status && res.data.forwardType == 'LOGIN') {
            window.location.href = this.managementSystemUrl + '/account/rewards?site=uk';
            return
          }
          //未登录 邮箱为老用户  老用户跳转登录页
          if (!this.isLoginStatusData.status && res.data.forwardType == 'LOGIN') {
            window.location.href = `https://uk.ulike.com/pages/member?winPrizeUserEmail=${this.subscripSuccessData.userEmail}`;
            return
          }
          //未登录情况下 新用户输入密码，默认注册成功
          if (res.data.forwardType == 'REGISTER') {
            $('.green-subscribe-module-dispatch').hide()
            $('.green-subscribe-module-jump').show()
          }
        }).catch((err) => {
          console.log(err);
          reject(err);
        })
        // this.closeScratch();
      }
      //点击右上角
      const dispatchclose = target.closest(".dispatch-close");
      if (dispatchclose) {
        this.closeScratch();
      }
      // 点击查看更多
      const subscribeMoreBtn = target.closest(".green-subscribe-module .subscribe-more-btn");
      if (subscribeMoreBtn) {
        commonGtmEvent('vip_register', '密码提交按钮', '');
        // 从页面上获取密码
        this.subscribeObj.password = this.$p
          .querySelector(".subscribe-more-input")
          .value.trim();
        if (!this.subscribeObj.password) {
          this.$p
            .querySelector(".subscribe-more-from")
            .classList.add("report-cont");
          this.$p.querySelector(".subscribe-more-inp-msg .text").innerHTML =
            'Enter your password to receive additional benefits';
          this.fadeIn(this.$p.querySelector(".subscribe-more-inp-msg"));
          return
        }
        //校验密码格式
        const REGEXP_PWD = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d\S]{6,16}$/;//校验密码
        if (!REGEXP_PWD.test(this.subscribeObj.password)) {
          console.log('错误');
          $('.unlock-more-ver .text').text('Your password requires 6-16 digits, and must contain letters and numbers')
          $('.unlock-more-ver').fadeIn()
          return
        } else {
          console.log('正确');
          $('.unlock-more-ver').fadeOut()
        }
        $('#green-subscribe-loading-overlay').css('display', 'flex');
        // this.isJumpCheck()
        this.sendApiRequest('/user/login', {
          since: "LOTTERY_LOGIN",
          userEmail: this.subscripSuccessData.userEmail,
          passWord: this.subscribeObj.password,
          // returnUrl: 'https://account.ulike.com/account/rewards?site=uk'
          returnUrl: this.managementSystemUrl+'/account/rewards?site=uk'
        }).then((res) => {
          $('#green-subscribe-loading-overlay').css('display', 'none');
          $('.right-input-password-checkbox').fadeIn()

          let countdown = 2;
          const timer = setInterval(() => {
            countdown--;
            // countdownElement.textContent = countdown;

            if (countdown === 0) {
              clearInterval(timer);
              //登录请求成功  跳转用户中心
              if (res.code == '0' && res.data) {
                window.location.href = res.data.loginUrl;
              }
            }
          }, 1000);
        }).catch((err) => {
          console.log(err);
          $('#green-subscribe-loading-overlay').css('display', 'none');
          reject(err);
        })
        return
        //判断是否登录方法 未登录记录埋点  跳转至登录页
        let _base = 'https://account.ulike.com'
        let userEmail = this.subscribeObj.userEmail;
        // this.subscribeObj.userEmail
        let locationUrl = `${_base}/login?returnUrl=${userEmail}`
        //判断登录状态 已登录直接跳转个人中心  未登录跳转到登录页面
        if (!this.getLoginStatus) {
          window.location.href = 'https://uk.ulike.com/pages/member';
          throw new Error("please login");
        } else {
          window.location.href = 'https://account.ulike.com/account/rewards?site=uk';
        }
      }
    });
    // 监听邮箱输入框按键事件
    this.$p
      .querySelector(".green-subscribe-module-input")
      .addEventListener("keyup", (e) => {
        this.$p
          .querySelector(".green-subscribe-module-from")
          .classList.remove("report-cont");
        this.fadeOut(this.$p.querySelector(".green-subscribe-module-inp-msg"));
      });
    // 监听邮箱输入框获取焦点事件
    this.$p
      .querySelector(".green-subscribe-module-from .green-subscribe-module-input")
      .addEventListener("focus", (e) => {
        commonGtmEvent('vip_enter email', '邮箱编辑框获取焦点', '');
      });
    // 监听输入密码框获取焦点事件
    this.$p
      .querySelector(".green-subscribe-module-jump .subscribe-more-input")
      .addEventListener("focus", (e) => {
        commonGtmEvent('vip_enter passward', '输入密码编辑框', '');
      });
    // 监听输入密码按键事件
    this.$p
      .querySelector(".subscribe-more-input")
      .addEventListener("keyup", (e) => {
        this.$p
          .querySelector(".subscribe-more-from")
          .classList.remove("report-cont");
        this.fadeOut(this.$p.querySelector(".subscribe-more-inp-msg"));
      });
    window.ulikeOpenSubscribe = () => {

      commonGtmEvent('vip_Teaser', 'Icon按钮点击', '');

      this.subscripSuccessData = localStorage.getItem('green-rotation-subscript-success-data') ? JSON.parse(localStorage.getItem('green-rotation-subscript-success-data')) : '';
    
      // this.showSubscript();
      if (!this.getCookie("green-rotation-subscript-isSubscribe")) {
        // 显示弹出框
        this.showSubscript();
      }
      this.updateSuccessDom(this.subscripSuccessData);

    };

    $(document).on('click', '#green-subscribe-module-checkbox', function () {
        $('#green-subscribe-module-checkbox').toggleClass('checked');
        that.isModulCheck()
    });
  }

  // 提交邮箱获取结果
  async getDispatch() {
    // 校验成功后去除默认动画
    $('.green-subscribe-module .tray-subscribe .tray-main').css('animation', 'none');
    $('.green-subscribe-module .tray-subscribe .tray-pointer').css('animation', 'none');
    // 按钮加载动画开启
    this.btnShowLoading(this.$p.querySelector(".green-subscribe-module-btn"));
    try {
      let resData = await this.sendApiRequest(
        "/promotion/sendBenefit",
        this.subscribeObj
      );
      // 按钮加载动画关闭
      this.btnShowLoading(
        this.$p.querySelector(".green-subscribe-module-btn"),
        false
      );
      if (resData.code === 0) {
        let data = resData.data; // Correct reference to resData.data
        // Add winning titles and prize URL
        Object.assign(data, {
          winning_title: this.subscribeActFrom.languageMessData.winning_title,
          winning_sub_title:
            this.subscribeActFrom.languageMessData.winning_sub_title,
          winning_code_title:
            this.subscribeActFrom.languageMessData.winning_code_title,
          prizeUrl: resData.url,
        });
        let dIndex = this.list.findIndex(
          (item) => item.itemName == data.benefitName
        );
        if (dIndex == -1) return;

        // 请求成功抽奖
        this.$p.querySelector(".green-subscribe-module-input").value = "";
        this.$p.classList.add("hide-text");
        setTimeout(() => {
          this.start(dIndex);
        }, 800);
        commonGtmEvent('vip_subscribe_successful', '邮箱提交按钮', '');
        //存储抽奖数据
        localStorage.setItem("green-rotation-subscript-success-data", JSON.stringify(data));
        this.updateSuccessDom(data);

        // Set cookies and local storage  
        //是否已成功抽奖
        this.setCookie("green-rotation-subscript-success", true, 2, true);
        this.setCookie("subscript-isSubscribe", true, 30, true);
        // 存储form表单数据
        this.setCookie(
          "green-rotation-success-activeFrom",
          this.subscribeActFrom.formActive.theme,
          2,
          true
        );
      } else if (
        resData.code === 99998 &&
        resData.message === "participate_email_repeat_err"
      ) {
        this.$p
          .querySelector(".green-subscribe-module-from")
          .classList.add("report-cont");
        this.$p.querySelector(".green-subscribe-module-inp-msg .text").innerHTML =
          'Each participant can only spin it once';
        this.fadeIn(this.$p.querySelector(".green-subscribe-module-inp-msg"));

      } else {
        // Handle other system errors
        this.$p
          .querySelector(".green-subscribe-module-from")
          .classList.add("report-cont");
        this.$p.querySelector(".green-subscribe-module-inp-msg .text").innerHTML =
          'System exception, please try again later';
        this.fadeIn(this.$p.querySelector(".green-subscribe-module-inp-msg"));
      }
    } catch (err) {
      console.log('err', err);

      // 按钮加载动画关闭
      this.btnShowLoading(
        this.$p.querySelector(".green-subscribe-module-btn"),
        false
      );
    }
  }

  // 更新结果页产品信息
  updateSuccessDom(data) {
    let list = JSON.parse(localStorage.getItem('subscrip-list-data'));
    if (!data) return
    //循环取出中奖数据
    let selectSup = {}
    list.forEach((item) => {
      if (item.itemType == data.benefitType && item.itemName == data.benefitName) {
        selectSup = item
      }
    })

    if (data.benefitType == 'COUPON') {
      $('.benefitType-goods-virtual').hide()
      $('.benefitType-coupon').show()
      // $(".benefitType-coupon .num").innerHTML = selectSup.itemName;
      this.$p.querySelector(".benefitType-coupon .num").innerHTML = selectSup.itemName
      // $('.benefitType-coupon .yhq-img').attr('src', selectSup.extend.prizeUrl);
    }
    if (data.benefitType == 'GOODS_VIRTUAL') {
      $('.benefitType-coupon').hide()
      $('.benefitType-goods-virtual').show()
      // $(".benefitType-goods-virtual .price-total .num").innerHTML = selectSup.itemName;

      // this.$p.querySelector("..benefitType-goods-virtual .yhq-img").attr('src', selectSup.extend.prizeUrl);
      $('.benefitType-goods-virtual .yhq-img').attr('src', selectSup.extend.prizeUrl);
      let parts = selectSup.itemName.split(" "); // 按空格分割 => []
      if (selectSup.itemName.toLowerCase().includes('free')) {
        this.$p.querySelector(".benefitType-goods-virtual .num").innerHTML = parts[0]
        this.$p.querySelector(".benefitType-goods-virtual .price-status").innerHTML = parts[1]
      }
      if (selectSup.itemName.toLowerCase().includes('points')) {
        this.$p.querySelector(".benefitType-goods-virtual .num").innerHTML = parts[0]
        this.$p.querySelector(".benefitType-goods-virtual .price-status").innerHTML = parts[1]
      }
    }
  }

  getValueByKey(data, targetKey) {
    const item = data.find((element) => element.key === targetKey);
    return item ? item.value : null; // 如果找到返回 value，否则返回 null
  }

  // 请求API接口
  sendApiRequest(url, data) {
    const controller = new AbortController();
    const signal = controller.signal;
    data.siteCode = "UK"; // Ensure the site code is set to 'US'
    // data.language = window.Shopify.locale
    // Set up the AJAX settings
    let urlLink = this.api + url;

    let settings = {
      method: "POST", // POST is used as the request method
      headers: {
        "Content-Type": "application/json", // Request payload is in JSON format
      },
      body: JSON.stringify(data), // Convert data object to JSON string
      signal,
      mode: "cors",
      credentials: "include",
    };

    // Return a new Promise
    return new Promise((resolve, reject) => {
      fetch(urlLink, settings)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json(); // 解析 JSON 响应
        })
        .then((data) => resolve(data)) // 解析后的数据传递给 `resolve`
        .catch((error) => {
          reject(error); // 发生错误时 `reject`
        });
    });
  }

  // 按钮添加loding效果
  btnShowLoading($el, isShow = true) {
    if (isShow) {
      $el.classList.add("loading-btn-cus");
      const loadingSpan = document.createElement("span");
      loadingSpan.className = "loading-span";
      $el.appendChild(loadingSpan);
    } else {
      $el.classList.remove("loading-btn-cus");
      const loadingSpan = $el.querySelector(".loading-span");
      if (loadingSpan) {
        loadingSpan.remove();
      }
    }
  }

  // 初始化抽奖盘右侧text
  domOnUpdate() {
    // 参与页
    this.$p.querySelector(".green-subscribe-module-text-title").innerHTML =
      this.subscribeActFrom.languageMessData["participate_main_title"];
    this.$p.querySelector(".green-subscribe-module-btn span").innerHTML =
      this.subscribeActFrom.languageMessData["btn_title"];
    this.$p
      .querySelector(".green-subscribe-module-btn .btn-txt")
      .setAttribute(
        "text",
        this.subscribeActFrom.languageMessData["btn_title"]
      );
    // this.$p.querySelector(".green-subscribe-module-text-tips").innerHTML =
    //   this.subscribeActFrom.languageMessData["participate_desc"];
  }
  // 填充装盘数据

  render() {
    //转盘数据
    this.$p.querySelector(".tray-part-one .num").innerHTML = this.list[0].itemName
    this.$p.querySelector(".tray-part-two .num").innerHTML = this.list[1].itemName
  }

  // 打开弹窗
  open() {
    if (this.isShow) return;
    this.isShow = true;
    commonGtmEvent('vip_impressions', '弹框的曝光次数统计', '');
    // if (this.isOpen()) {
    if (this.$p.classList.contains("is-close")) {
      this.$p.classList.remove("is-close");
      this.animateValue({
        start: 150,
        end: 0,
        duration: 1000, // 动画时长为 600 毫秒
        onUpdate: (value) => {
          this.$p.style.setProperty("display", "block");
          this.$p.style.setProperty("--clip-path", `${150 - value}%`);
          this.$p.style.setProperty("--origin-x", `${value}%`);
          this.$p.style.setProperty("--origin-y", `${value}%`);
        },
        onComplete: () => { },
      });
    } else {
      this.fadeIn(this.$p, null, 500);
   
    }

    const $subscribeModuleFrom = $('.green-subscribe-module-from'); 
    const $subscribeModuleInput = $('.green-subscribe-module-input');
    $('.tray-main,.tray-pointer').addClass('animation-active');
    // 左侧叶子晃动两秒后停止
    setTimeout(function(){
      $('.tray-main,.tray-pointer').removeClass('animation-active');
      //再过两秒后如果输入框没有获取焦点或输入内容则晃动输入框
      setTimeout(function(){
        if (!$subscribeModuleInput.is(':focus') && $subscribeModuleInput.val().trim() === '') {
          $subscribeModuleFrom.addClass('report-cont-white');
        }
        setTimeout(function(){
          $subscribeModuleFrom.removeClass('report-cont-white');
        },500);
      },2000);

     
    },2000)
  }

  isOpen(param) {
    let isOpen = sessionStorage.getItem("isOpenScratchUlike");
    if (param) {
      sessionStorage.setItem("isOpenScratchUlike", param);
    }
    return isOpen;
  }

  // 关闭转盘弹窗
  closeScratch() {
    const targetRect = document
      .querySelector(".green-subscribe-teaser-app")
      .getBoundingClientRect();
    const deltaX = targetRect.left + 20;
    const deltaY = targetRect.top + 20;
    this.$p.style.setProperty("--origin-x", `${deltaX}px`);
    this.$p.style.setProperty("--origin-y", `${deltaY}px`);
    this.animateValue({
      start: 0,
      end: 150,
      duration: 600, // 动画时长为 2000 毫秒
      onUpdate: (value) => {
        // console.log(value); // 每帧更新时调用，输出当前值
        // 你可以在这里更新元素的样式，例如：element.style.opacity = value;
        this.$p.style.setProperty("--clip-path", `${150 - value}%`);
        this.$p.style.setProperty("opacity", `${1 - value / 150}`);
      },
      onComplete: () => {
        this.isShow = false;
        this.$p.style.setProperty("opacity", "1");
        this.$p.classList.add("is-close");
      },
    });
  }

  // 转盘转动
  start(num) {
    if (this.isRunning) return;
    this.isRunning = true;
    this.rotate += 360 * 4;
    let getPrizeIndex = num + 1; //(Math.floor(Math.random() * 6) + 1) - 1;//Math.floor(Math.random() * 6) + 1 ==>1-6
    this.mathDeg = Math.floor(Math.random() * (60 - 30 + 1)) + 30;
    this.rotates =
      this.rotate +
      (180 - this.perAngle) / 2 -
      this.perAngle * getPrizeIndex +
      this.mathDeg +
      160;
    // this.rotates =
    //   this.rotate +
    //   (180 - this.perAngle) / 2 -
    //   this.perAngle * getPrizeIndex +
    //   this.mathDeg +
    //   120;
    this.main.style.transition = "all 3s ease";
    this.main.style.transform = `rotateZ(${this.rotates}deg)`;
    let yelowShowClass = ".green-subscribe-module .green_leaf_flex_" + getPrizeIndex.toString()
    setTimeout(() => {
      $(yelowShowClass).show()
      // this.connectTest();
    }, 7000);
  }

  // 转盘结束转动
  end() {
    if (!this.isRunning) return;
    this.isRunning = false;
    let d = this.rotates - this.mathDeg + 10;
    this.main.style.transform = "rotateZ(" + d + "deg)";
    this.main.style.transition = "all 3s ease";
    setTimeout(() => {
      this.fadeOut(
        this.$p.querySelector(".green-subscribe-module-cont"),
        () => {

          this.$p.classList.add("dispatch-cont");
          this.$p.classList.remove("hide-text");
          this.fadeIn(
            this.$p.querySelector(".green-subscribe-module-cont"),
            null,
            800
          );
        },
       500
      );
    }, 6000);
  }

  // 校验邮箱
  validateEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  // js根据时间计算动画
  animateValue({ start, end, duration, onUpdate, onComplete }) {
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

  // 中奖用户轮播
  verticalCarousel(delay = 1200, speed = 500) {
    const ul = this.$p.querySelector(".green-subscribe-module-slide-list");
    const items = ul.querySelectorAll(".green-subscribe-module-slide-item");
    const itemHeight = 26;

    function moveSlide() {
      ul.style.transform = `translateY(-${itemHeight}px)`;
      ul.style.transition = `transform ${speed}ms ease-in-out`;

      setTimeout(() => {
        ul.appendChild(ul.firstElementChild);
        ul.style.transition = "none";
        ul.style.transform = "translateY(0)";
      }, speed);
    }

    setInterval(moveSlide, delay);
  }

  // 礼花效果
  connectTest() {
    moduleUlike.exports({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.5 },
      colors: ["F5D290", "FEEFCF", "F0C37C"],
      disableForReducedMotion: true, // 优化低性能设备
    });
  }

  // dom显示
  fadeIn(element, callback = null, duration = 400) {
    if (window.getComputedStyle(element).display === "none") {
      element.style.display = "block"; // 先显示元素
      element.style.opacity = 0; // 设为透明
    }

    let startTime = performance.now();

    function animate(currentTime) {
      let elapsedTime = currentTime - startTime;
      let progress = elapsedTime / duration;

      if (progress >= 1) {
        element.style.opacity = 1; // 透明度设为 1
        if (callback) callback(); // 调用回调函数
      } else {
        element.style.opacity = progress;
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }

  // dom隐藏
  fadeOut(element, callback = null, duration = 400) {
    let startTime = performance.now();

    function animate(currentTime) {
      let elapsedTime = currentTime - startTime;
      let progress = elapsedTime / duration;

      if (progress >= 1) {
        element.style.opacity = 0;
        element.style.display = "none"; // 完全隐藏
        if (callback) callback(); // 调用回调函数
      } else {
        element.style.opacity = 1 - progress;
        requestAnimationFrame(animate);
      }
    }

    requestAnimationFrame(animate);
  }

  // 获取cookie值
  getCookie(name) {
    const cookieName = name + "=";
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i].trim();
      if (cookie.indexOf(cookieName) === 0) {
        return cookie.substring(cookieName.length, cookie.length);
      }
    }
    return "";
  }

  /**
   * 设置cookie
   */
  setCookie(cookieName, cookieValue, daysToExpire, endOfDay = false) {
    var expires = "";
    if (daysToExpire) {
      var date = new Date();
      date.setTime(date.getTime() + daysToExpire * 24 * 60 * 60 * 1000);
      if (endOfDay) {
        date.setHours("00", "00", "00", "000"); // 设置为那天的第一秒
      }
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = cookieName + "=" + cookieValue + expires + "; path=/";
  }
}
// 暂时清除全部cookie
function clearAllData() {
  const cookies = document.cookie.split(";");

  for (let cookie of cookies) {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
  }
  // 清除 localStorage
  localStorage.clear();

  // 清除 sessionStorage
  sessionStorage.clear();
}

// 确保在页面加载完成后执行
const wheel = new Wheel(".green-subscribe-module");
