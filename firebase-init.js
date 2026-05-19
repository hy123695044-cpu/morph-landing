/* Firebase 初始化
 * 使用说明：
 * 1. 打开 https://console.firebase.google.com 创建项目
 * 2. 启用 Authentication → Email/密码登录
 * 3. 创建 Cloud Firestore 数据库（测试模式）
 * 4. 把下面的配置信息换成你自己的
 * 项目设置 → 一般 → 您的应用 → Web 应用 → 配置
 */
var firebaseConfig = {
  apiKey: "AIzaSyBmc-dIh_aQUiezzxSbjJdVML_OZj1_8xc",
  authDomain: "morph-landing.firebaseapp.com",
  projectId: "morph-landing",
  storageBucket: "morph-landing.firebasestorage.app",
  messagingSenderId: "1097463451061",
  appId: "1:1097463451061:web:b85c8eac3905a61fb19dfc"
};

/* Firebase 是否已配置 */
var _firebaseReady = false;

/* 尝试初始化 Firebase */
try {
  if (typeof firebase !== 'undefined' && firebaseConfig.apiKey !== "YOUR_API_KEY") {
    firebase.initializeApp(firebaseConfig);
    _firebaseReady = true;
    console.log('🔥 Firebase 已连接');
  } else {
    console.log('⚠️ Firebase 未配置，使用演示模式');
  }
} catch(e) {
  console.log('⚠️ Firebase 加载失败:', e.message);
}
