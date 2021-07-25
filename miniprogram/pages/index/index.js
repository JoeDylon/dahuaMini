import Toast from '../../miniprogram_npm/@vant/weapp/toast/toast'
import util from '../../util/util'

//index.js
const app = getApp()
const INIT_MARKER = {
  iconPath: './imgs/Marker1_Activated@3x.png',
  width: '34px',
  height: '34px',
  rotate: 0,
  alpha: 1
};

Page({
  data: {
    latitude: 0,
    longitude: 0,
    currentCity: null,
    selectorVisible: false,
    leftText: '选择城市',
    companyShow: false,
    markers: null,
    includePoints: [],
    scale: 3,
    key: '73FBZ-7N2CX-6VA4V-TWGPU-4RZQJ-D5BX4',
    referer: '大丰华',
  },

  onLoad: function () {
    // 获取定位
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({
          latitude: Number(res.latitude).toString(),
          longitude: Number(res.longitude).toString(),
          markers: null,
        })
      }
    })
  },

  zoomOut: function () {
    if (this.data.scale >= 20) return;
    this.setData({
      scale: this.data.scale + 1,
    })
  },

  zoomIn: function () {
    if (this.data.scale <= 3) return;
    this.setData({
      scale: this.data.scale - 1,
    })
  },

  onSelectCity: async function (e) {
    const city = e.detail.city.name
    if (this.data.currentCity === city) return
    // 切换位置
    const latitude = Number(e.detail.city.location.latitude)
    const longitude = Number(e.detail.city.location.longitude)
    this.setData({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      leftText: e.detail.city.name,
    })
    // 获取在该城市经营的公司
    wx.showLoading({
      title: '查询中',
    })
    const {
      result: companies
    } = await wx.cloud.callFunction({
      name: 'queryCompanies',
      data: {
        city,
      },
    })
    wx.hideLoading()
    if (companies.length === 0) {
      Toast(`在${city}没有往来的工厂`);
      return;
    }
    const markers = companies.map((company, index) => {
      return {
        ...INIT_MARKER,
        callout: {
          fontSize: '12px',
          content: company.companyInfo.name,
          padding: 10,
          borderRadius: 2,
          display: 'ALWAYS'
        },
        latitude: company.companyInfo.latitude,
        longitude: company.companyInfo.longitude,
        id: index,
      }
    })
    const includePoints = companies.map((company) => {
      return {
        latitude: company.companyInfo.latitude,
        longitude: company.companyInfo.longitude,
      }
    })
    this.setData({
      markers,
      companies,
    })
    setTimeout(() => {
      this.setData({
        includePoints
      })
    }, 500)
  },

  onMarkerTap: function (e) {
    const {
      detail: {
        markerId
      }
    } = e;
    if (this.data.currentMarkerId !== undefined) {
      const LasttimeMarker = this.data.markers.find(marker => marker.id === this.data.currentMarkerId)
      LasttimeMarker.callout.fontSize = '12px'
      LasttimeMarker.width = '34px'
      LasttimeMarker.height = '34px'
    }
    const selectedMarker = this.data.markers.find(marker => marker.id === markerId)
    const selectedCompanyIndex = this.data.markers.findIndex((marker) => marker === selectedMarker)
    selectedMarker.callout.fontSize = '16px'
    selectedMarker.width = '60px'
    selectedMarker.height = '60px'
    this.setData({
      markers: this.data.markers,
      selectedCompany: this.data.companies[selectedCompanyIndex],
      currentMarkerId: markerId,
      companyShow: true,
    });
  },

  onCompanyClose: function (e) {
    this.setData({
      companyShow: false
    })
  },

  onClickLeft: function () {
    this.setData({
      selectorVisible: true,
      // markers: false,
      // includePoints: false,
    })
  },

  // 上传图片
  doUpload: function () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]
        console.log(res.tempFilePaths[0])

        // 上传图片
        const cloudPath = `my-image${filePath.match(/\.[^.]+?$/)[0]}`
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath

            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })
      },
      fail: e => {
        console.error(e)
      }
    })
  },

})