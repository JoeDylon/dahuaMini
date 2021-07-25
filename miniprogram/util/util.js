function useCallbackWithLoadingEffect(callback) {
  if (!callback) return
  wx.showLoading({
    title: '加载中',
  })
  return callback().then(
    (res) => {
      wx.hideLoading()
      return res
    }
  )
}

export default {
  useCallbackWithLoadingEffect,
}