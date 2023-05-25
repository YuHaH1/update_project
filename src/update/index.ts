
import type { IOptions } from '../types'
declare const VERSION: string
const regSrc = /<script.*src=["'](?<src>[^"']+)/gm
class Updater {
  oldSrcList: string[]
  version: string
  url: string
  cb: IOptions['cb']
  time: number
  needUpdate: boolean
  lastTime: number
  #updateEvent: Event | null
  #stop: boolean
  #id: number
  constructor(options: IOptions | null) {
    this.#id = 0
    this.url = options?.url || '/'
    this.#updateEvent = null
    this.#stop = false
    this.initEvent()
    this.version = VERSION
    this.cb = options?.cb
    this.watch()
    this.oldSrcList = []
    this.lastTime = new Date().getTime()
    this.needUpdate = false
    this.time = options?.time || 5 * 1000 * 60
  }

  get stop() {
    return this.#stop
  }

  set stop(value) {
    if (typeof value !== 'boolean')
      console.warn('if you want to stop check please set stop with boolean')
    this.#stop = value
    if (this.#stop) {
      cancelIdleCallback(this.#id)
      window.removeEventListener('auto-update', this.handleAutoUpdate)
    }
    else {
      // 初始化事件
      this.initEvent()
      this.watch()
    }
  }

  watch = () => {
    this.#id = requestIdleCallback(() => {
      const now = new Date().getTime()
      if (now - this.lastTime >= this.time) {
        this.lastTime = now
        this.main()
      }
      else {
        this.watch()
      }
    })
  }

  handleAutoUpdate = () => {
    this.cb && this.cb()
    if (!this.cb) {
      requestAnimationFrame(() => {
        location.reload()
      })
    }
  }

  initEvent = () => {
    this.#updateEvent = new Event('auto-update')
    window.addEventListener('auto-update', this.handleAutoUpdate)
  }

  // 拉取html内容
  fetchFileContent = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      // 防止缓存加上时间戳
      fetch(`${this.url}?timestamp=${Date.now()}`).then(res => res.text()).then((res) => {
        resolve(res)
      }).catch(err => reject(err))
    })
  }

  checkChange = (res: Array<string>) => {
    if (this.oldSrcList.join('') === res.join('')) { this.needUpdate = false }
    else {
      this.oldSrcList = res
      this.needUpdate = true
    }
  }

  getScriptSrc = (content: string) => {
    const res = content.match(regSrc)
    if (res && res.length) {
      if (!this.oldSrcList.length)// 首次
        this.oldSrcList.push(...res)
      this.checkChange(res)
    }
    else {
      console.warn('don\'t find script src')
    }
  }

  checkUpdate = (): void => {
    if (!this.needUpdate) return
    this.#updateEvent && window.dispatchEvent(this.#updateEvent)
  }

  main = async () => {
    try {
      // 获取index.html的字符串
      const res = await this.fetchFileContent()
      // 解析字符串并保存
      this.getScriptSrc(res)
      // 检查是否需要更新
      this.checkUpdate()
      // 轮询
      this.watch()
    }
    catch (error) {
      console.warn(error)
    }
  }
}

// 单例
let instance: Updater | null = null
const proxyUpdater = new Proxy(Updater, {
  construct(Target, args: any[]) {
    const arg = {
      ...args[0],
    }
    if (!instance)
      instance = new Target(arg as IOptions)
    return instance
  },
})
export default proxyUpdater
