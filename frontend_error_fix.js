// Updated error message for the frontend
// Replace the error message in your sendCodeToServer function:

wx.showModal({
  title: '网络请求失败',
  content: `无法连接到服务器: ${err.errMsg}\n\n请确保：\n1. 后端服务器正在运行\n2. Vercel 部署正常工作\n3. 网络连接正常`,
  showCancel: false
}); 