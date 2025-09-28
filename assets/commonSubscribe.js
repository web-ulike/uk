/**
 * 公共订阅方法:
 * 根据配置模板选择不同的脚本
 * 1. 订阅页面
 */
// 活动公共对象

// 定义订阅信息对象，用于存储用户订阅服务的相关信息
const subscribeForm = {
  // 用户姓名
  name: "",
  // 用户邮箱地址
  userEmail: "",
  // 用户联系电话号码
  phoneNumber: "",
  // 用户参与的活动ID
  activityId: "",
  // 来源代码，标识用户来源渠道
  sourceCode: "",
  // 扩展信息，用于记录营销活动的详细来源信息
  extend: {
    // 用户来源的具体描述，如广告来源
    utm_source: "",
  },
  // 标识用户是否同意接收营销信息
  isMarketing: false,
};

// 当前页面
var pathname = window.location.origin + location.pathname;
const siteCode = 'UK';
// api.myulike.test  测试环境
// api.ulike.com  测试环境
// 'http://api.myulike.com';  老接口
// api-test.idsoy.com https
const api = 'http://api.ulike.com';
const shopCurrencySymbol = '£';

// 活动存储对象
const subscribeActFrom = {
  activityId: '',
  resourceId: '',
  sourceCode: '',
  activityItem: '',
  currentData: '',
  languageMessData: '',
  formActive: {
    theme: 0
  },
}

$(function () {
  // 判断是否参与过奖品
  let subscripSuccessData = getCookie("subscript-success-data");
  let _subscribeActFrom = getCookie('subscript-success-activeFrom');
  if (!getCookie("subscript-success") || subscripSuccessData == "" || _subscribeActFrom == "") {
    // 获取活动配置信息
    getActiveInitConfig();
  } else if (subscripSuccessData) {
    // 直接渲染类型活动奖品
    subscribeActFrom.formActive.theme = _subscribeActFrom;
    loadScriptSubscribe();
  }
});

/**
 * 获取活动配置
 */
function getActiveInitConfig() {
  let time = parseInt(new Date().getTime() / 1000);
  sendApiRequest("/promotion/queryTargetInfoList", {
    targetStatus: "PUBLISH",
    afterStartTime: time,
    beforeEndTime: time,
    targetType: "ACTIVITY",
    resourceType: "SUBSCRIBE_ACTIVITY",
  })
    .then((res) => {
      if (res.code == 0 && res.data.length > 0) {
        // 判断是否多活动属性
        const currentData = getCurrentActivity(res.data);
        // 初次访问
        setCookie("subscript-First-Visit", currentData.resourceId, 2);
        formatActiveData(currentData);
        delete currentData.languageMessageDtoList
        delete currentData.targetPluginDtoList
        subscribeActFrom.currentData = currentData;
        subscribeActFrom.resourceId = currentData.resourceId;
        loadScriptSubscribe();
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

/**
 * 发送API请求的函数
 * 
 * @param {string} url 请求的API地址
 * @param {Object} data 要发送的数据，格式为JSON对象
 * @param {Object} callbacks 回调函数对象，可包含success和error两个方法
 * @returns 无返回值
 */
function sendApiRequest(url, data) {
  data.siteCode = siteCode; // Ensure the site code is set to 'UK'
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


function formatActiveData(data) {
  lottery = [];
  let languageMessageDtoList = {};
  // 获取奖品数据;
  var activityItem = data.resourceObject.activityItemDtoList;
  subscribeActFrom.formActive = reverseTransform(data.targetPluginDtoList);
  subscribeActFrom.activityItem = activityItem;

  for (let index = 0; index < data.languageMessageDtoList.length; index++) {
    let _ths = data.languageMessageDtoList[index];
    languageMessageDtoList[_ths.key] = _ths.value;
  }
  subscribeActFrom.languageMessData = languageMessageDtoList;
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

function loadScriptSubscribe (){
  let _src = '';
  let _link  = '';
  let showId = '';
  if(subscribeActFrom.formActive.theme == 0 || subscribeActFrom.formActive.theme == undefined ){
    $('#app-plug-2').remove();
    showId = 'app-plug-1';
    _src = subscriptCopywriting.theme_script1;
    _link = subscriptCopywriting.theme_link1;
  } else {
    showId = 'app-plug-2';
    $('#app-plug-1').remove();
    _src = subscriptCopywriting.theme_script2;
    _link = subscriptCopywriting.theme_link2;
  }

  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = _link;  // 这里是你的 CSS 文件路径
  link.type = "text/css";
  document.head.appendChild(link);  // 将 link 元素添加到 head 中

  // 旧的转盘
  const script = document.createElement("script"); // 设置
  script.src = _src;
  script.type = "text/javascript";
  script.async = true;
  document.head.appendChild(script);
  $('#'+ showId).show();
}