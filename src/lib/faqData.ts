export type Language = 'zh-TW' | 'en' | 'zh-CN';

export interface FAQ {
  keywords: string[];
  answer: {
    'zh-TW': string;
    'en': string;
    'zh-CN': string;
  };
}

export const faqs: FAQ[] = [
  {
    keywords: ['價格', '費用', '收費', '多少錢', 'cost', 'price', '費用', '价'],
    answer: {
      'zh-TW': '感謝您的詢問！我們的方案根據使用人數和功能需求而定。請訪問我們的 pricing 頁面或聯繫業務團隊取得詳細報價。',
      'en': 'Thank you for your inquiry! Our plans are based on the number of users and feature requirements. Please visit our pricing page or contact our sales team for a detailed quote.',
      'zh-CN': '感谢您的询问！我们的方案根据使用人数和功能需求而定。请访问我们的 pricing 页面或联系业务团队取得详细报价。',
    },
  },
  {
    keywords: ['如何', '怎麼', '怎樣', '使用', '開通', '開始', 'how', 'start', '使用', '开通', '开'],
    answer: {
      'zh-TW': '您好！開通帳戶非常簡單：1. 註冊並驗證 email。2. 選擇適合的方案。3. 邀請團隊成員。4. 開始使用！如有疑問可隨時聯繫客服。',
      'en': 'Hello! Activating your account is simple: 1. Register and verify your email. 2. Choose a suitable plan. 3. Invite team members. 4. Start using it! Feel free to contact support if you have questions.',
      'zh-CN': '您好！开通帐户非常简单：1. 注册并验证 email。2. 选择适合的方案。3. 邀请团队成员。4. 开始使用！如有疑问可随时联系客服。',
    },
  },
  {
    keywords: ['密碼', '忘記', '重設', 'reset', 'password', '忘记', '忘记密码', '密码'],
    answer: {
      'zh-TW': '若您忘記密碼，請在登入頁點擊「忘記密碼」，系統會發送重設連結至您的註冊 email，請在 24 小時內完成重設。',
      'en': 'If you forgot your password, click "Forgot Password" on the login page. The system will send a reset link to your registered email. Please complete the reset within 24 hours.',
      'zh-CN': '若您忘记密码，请在登入页点击「忘记密码」，系统会发送重设连结至您的注册 email，请在 24 小时内完成重设。',
    },
  },
  {
    keywords: ['退款', '取消', '訂閱', '退訂', 'refund', 'cancel', 'unsubscribe', '取消订阅'],
    answer: {
      'zh-TW': '我們提供 30 天退款保證。若想取消訂閱，請至「帳戶設定」→「訂閱管理」操作，或聯繫客服協助處理。',
      'en': 'We offer a 30-day money-back guarantee. To cancel your subscription, go to "Account Settings" → "Subscription Management", or contact support for assistance.',
      'zh-CN': '我们提供 30 天退款保证。若想取消订阅，请至「帐户设定」→「订阅管理」操作，或联系客服协助处理。',
    },
  },
  {
    keywords: ['功能', '可以做', '能力', 'feature', 'ability', '功能', '功能介'],
    answer: {
      'zh-TW': '我們的系統提供：AI 客服機器人、多管道整合、對話管理、資料分析、自動化工作流等核心功能。歡迎到功能頁面了解更多！',
      'en': 'Our system provides: AI customer service bot, multi-channel integration, conversation management, data analytics, automated workflows, and more core features. Visit our features page to learn more!',
      'zh-CN': '我们的系统提供：AI 客服机器人、多管道整合、对话管理、资料分析、自动化工作流等核心功能。欢迎到功能页面了解更多！',
    },
  },
  {
    keywords: ['聯絡', '聯繫', '客服', '聯繫我們', 'contact', 'support', 'help', '联系', '联系', '客服'],
    answer: {
      'zh-TW': '您可以透過以下方式聯繫我們：📧 support@sierra.ai 📞 +886-2-XXXX-XXXX (平日 9:00-18:00) 💬 線上即時聊天',
      'en': 'You can reach us via: 📧 support@sierra.ai 📞 +886-2-XXXX-XXXX (Weekdays 9:00-18:00) 💬 Live chat',
      'zh-CN': '您可以透过以下方式联系我们：📧 support@sierra.ai 📞 +886-2-XXXX-XXXX (平日 9:00-18:00) 💬 线上即时聊天',
    },
  },
  {
    keywords: ['匯款', '付款方式', '刷卡', 'payment', 'pay', '付款', '支付', '转账'],
    answer: {
      'zh-TW': '我們支援信用卡、金融卡、ATM 轉帳、銀行轉帳等多種付款方式。企業客戶亦可申請月結付款。',
      'en': 'We support credit cards, debit cards, ATM transfers, bank transfers, and other payment methods. Enterprise customers can also apply for monthly billing.',
      'zh-CN': '我们支援信用卡、金融卡、ATM 转帐、银行转帐等多种付款方式。企业客户亦可申请月结付款。',
    },
  },
  {
    keywords: ['技術', '故障', '不能用', '壞掉', 'bug', 'error', 'issue', '技术问题', '故障', '异常'],
    answer: {
      'zh-TW': '很抱歉造成不便！請嘗試重新整理頁面或清除瀏覽器快取。若問題持續，請截圖並透過客服管道回報，我們會儘快處理。',
      'en': 'We apologize for the inconvenience! Please try refreshing the page or clearing your browser cache. If the problem persists, please take a screenshot and report it through our support channels. We will handle it as soon as possible.',
      'zh-CN': '很抱歉造成不便！请尝试重新整理页面或清除浏览器快取。若问题持续，请截图并透过客服管道回报，我们会尽快处理。',
    },
  },
  {
    keywords: ['資料', '隱私', '安全', 'GDPR', 'privacy', 'security', 'data', '资料', '隐私'],
    answer: {
      'zh-TW': '我們非常重視資料安全。所有資料傳輸均使用 TLS 1.3 加密，並符合 GDPR 規範。詳細資訊請參閱我們的隱私權政策。',
      'en': 'We take data security very seriously. All data transmission is encrypted using TLS 1.3 and complies with GDPR regulations. Please refer to our Privacy Policy for more details.',
      'zh-CN': '我们非常重视资料安全。所有资料传输均使用 TLS 1.3 加密，并符合 GDPR 规范。详细信息请参阅我们的隐私权政策。',
    },
  },
  {
    keywords: ['培訓', '教學', '文件', '文档', 'documentation', 'tutorial', 'guide', '培训', '教程'],
    answer: {
      'zh-TW': '我們提供完整的線上文件中心、視訊教學和入職培訓服務。歡迎前往說明中心或聯繫您的專屬業務代表了解更多！',
      'en': 'We provide a complete online documentation center, video tutorials, and onboarding training services. Visit our help center or contact your dedicated account representative to learn more!',
      'zh-CN': '我们提供完整的线上文件中心、视讯教学和入职培训服务。欢迎前往说明中心或联系您的专属业务代表了解更多！',
    },
  },
];

// 關鍵字匹配核心
export function findFAQAnswer(input: string, lang: Language): string | null {
  const normalized = input.toLowerCase();
  for (const faq of faqs) {
    for (const kw of faq.keywords) {
      if (normalized.includes(kw.toLowerCase())) {
        return faq.answer[lang];
      }
    }
  }
  return null;
}

// 偵測語言
export function detectLanguage(text: string): Language {
  const zhCNChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  const enWords = (text.match(/[a-zA-Z]+/g) || []).length;
  const zhCNRatio = zhCNChars / text.length;
  
  if (zhCNRatio > 0.4) {
    // 進一步判斷簡體或繁體
    const simplifiedChars = (text.match(/[\u4e00-\u9fa5]/g) || []).filter(c => {
      const cp = c.codePointAt(0)!;
      return (cp >= 0x4E00 && cp <= 0x9FA5);
    }).length;
    const traditionalIndicators = ['嗎', '麼', '這', '個', '說', '時', '國', '開', '關', '長', '門', '東', '西'];
    const hasTraditional = traditionalIndicators.some(ind => text.includes(ind));
    if (hasTraditional) return 'zh-TW';
    return 'zh-CN';
  }
  if (enWords > zhCNChars) return 'en';
  return 'zh-TW';
}
