import { createVNode } from 'vue'
import { notification, Modal } from 'ant-design-vue'
import { ACCESS_TOKEN, STORAGE_PREFIX } from '../store/mutation-types'
import { QuestionCircleOutlined } from '@ant-design/icons-vue'
import { TokenInfo, RecordItem, CommentItem } from '../types'
import { ConfirmOptions, MessageType } from '../types/tip'
import { domainUrl } from '../api/request'
import DAYJS from 'dayjs'

/**
 * Notification 消息通知
 * @param {*} message 提示标题
 * @param {*} description 提示信息内容
 * @param {*} type 提示类型
 * @param {*} duration 持续时长（s）
 * */
export function notify(
    message: string,
    description: string,
    type: MessageType = 'info',
    duration = 4.5
) {
    notification[type]({ message, description, duration })
}

export function infoNotify(description: string) {
    notification.info({
        message: 'Notice~',
        description
    })
}

export function successNotify(description: string) {
    notification.success({
        message: 'Congratulations~',
        description
    })
}

export function warningNotify(description: string) {
    notification.warning({
        message: 'Sorry~',
        description
    })
}

export function errorNotify(description: string, message: string = 'Something wrong~') {
    notification.error({
        message,
        description
    })
}

/**
 * 确认
 * */
export function Confirm(options: ConfirmOptions) {
    Modal.confirm({
        centered: true,
        type: 'warning',
        icon: options.icon || createVNode(QuestionCircleOutlined),
        content: options.content,
        onOk: options.onOk,
        onCancel: options.onCancel,
        title: options.title || 'Confirm',
        okText: options.okText || 'Confirm',
        cancelText: options.cancelText || 'Cancel',
        maskClosable: false
    })
}

/**
 * 确认删除
 * */
export function confirmPro(content: string = '') {
    return new Promise((resolve, reject) => {
        Modal.confirm({
            centered: true,
            type: 'warning',
            icon: createVNode(QuestionCircleOutlined),
            content,
            onOk: () => { resolve(true) },
            onCancel: () => { reject(false) },
            title: 'Confirm',
            okText: 'Confirm',
            cancelText: 'Cancel',
            maskClosable: false
        })
    })
}

/**
 * LocalStorage 存储 token 信息
 * @param {*} info ({ token: string, expireTime: number }) token 信息
 * */
export function setStorageToken(info: TokenInfo): void {
    const now: number = new Date().getTime()
    const tokenInfo: TokenInfo = {
        token: info.token,
        expireTime: now + info.expireTime * 1000
    }
    setStorageItem<TokenInfo>(ACCESS_TOKEN, tokenInfo)
}

/**
 * 获取并校验 token 是否存在或已过期
 * 过期则从 LocalStorage 中移除 token
 * */
export function getStorageToken(): null | string {
    const tokenInfo = getStorageItem<TokenInfo>(ACCESS_TOKEN)
    // token 存在
    if (tokenInfo !== null) {
        const { token, expireTime } = tokenInfo
        const now: number = new Date().getTime()
        // 未过期
        if (expireTime > now) {
            return token
        }
        // token 过期 => 移除 token
        removeStorageItem(ACCESS_TOKEN)
    }
    return null
}

/**
 * LocalStorage 操作
 * */
export function setStorageItem<V>(name: string, value: V): void {
    const KEY = STORAGE_PREFIX + name
    localStorage.setItem(KEY, JSON.stringify(value))
}

export function getStorageItem<V>(name: string): null | V {
    const KEY = STORAGE_PREFIX + name
    const value = localStorage.getItem(KEY)
    // KEY 存在 / 存的值不为 ''
    if (value !== null && value !== '') {
        return JSON.parse(value) as V
    }
    return null
}

export function removeStorageItem(name: string): void {
    const infoStr = getStorageItem(name)
    const KEY = STORAGE_PREFIX + name
    if (infoStr !== null) {
        localStorage.removeItem(KEY)
    }
}

/**
 * 防抖
 * @param fn
 * @param delay
 * @param immediate
 */
export function debounce(fn: Function, delay: number, immediate: boolean = false) {
    let timer: any = null
    return function (...args: any[]) {
        // @ts-ignore
        const ctx = this
        let callNow
        if (timer !== null) clearTimeout(timer)
        if (immediate) {
            callNow = !timer
            if (callNow) {
                fn.apply(ctx, args)
            }
            timer = setTimeout(() => {
                timer = null
            }, delay)
        } else {
            timer = setTimeout(() => {
                fn.apply(ctx, args)
            }, delay)
        }
    }
}

/**
 * 节流
 * @param fn
 * @param delay
 */
export function throttle(fn: Function, delay: number = 3000) {
    let timer: any = null
    let startTime: number
    return function (...args: any[]) {
        // @ts-ignore
        const ctx = this
        const now = Date.now()
        if (startTime && now < startTime + delay) {
            if (timer) clearTimeout(timer)
            timer = setTimeout(() => {
                startTime = now
                fn.apply(ctx, args)
            }, delay)
        } else {
            startTime = now
            fn.apply(ctx, args)
        }
    }
}

/**
 * 设置 cookie
 * @param {*} name cookie 名
 * @param {*} value cookie 值
 * @param {*} expireTime cookie 过期时长（s）
 * */
export function setCookie(name: string, value: string, expireTime: number) {
    const expire: Date = new Date()
    expire.setTime(expire.getTime() + expireTime * 1000)
    document.cookie = name + '=' + escape(value) + ';path=/' + ';expires=' + expire.toUTCString()
}

export function getCookie(name: string): string | null {
    const matchRes: null | string[] = document.cookie.match(new RegExp('(^| )' + name + '=([^;]*)(;|$)'))
    if (matchRes !== null) {
        return matchRes[2]
    } else {
        return null
    }
}

export function deleteCookie(name: string): void {
    const cookieVal = getCookie(name)
    if (cookieVal !== null) {
        const expired = new Date()
        expired.setTime(expired.getTime() - 1)
        document.cookie = name + '=' + cookieVal + ';expires=' + expired.toUTCString()
    }
}

export function mapRecordTime(recordList: RecordItem[]) {
    return recordList.map(item => {
        return {
            ...item,
            show: item.is_delete === 0,
            createTime: formatTime(item.ctime),
            updateTime: formatTime(item.utime)
        }
    })
}

/**
 * file 转换为 Base64 编码
 * */
export function convertAsBase64Code(file: File) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result)
        reader.onerror = error => reject(error)
    })
}

export function formatTime(
    time: number,
    timeFormat: string = 'YYYY-MM-DD HH:mm'
) {
    return time ? DAYJS(time).format(timeFormat) : '=.='
}

interface CtimeItem {
    ctime: number
}

/**
 * format time
 * */
export function mapFormatCtimeList<T extends CtimeItem>(list: T[]) {
    return list.map(
        item => ({
            ...item,
            createTime: formatTime(item.ctime)
        })
    )
}

/**
 *
 * */
export function mapCommentList(list: CommentItem[]) {
    return list.map(
        item => ({
            ...item,
            createTime: formatTime(item.ctime),
            from: item.fromName ? (item.fromName + '\r\n【' + item.fromEmail + '】') : '',
            to: item.toName ? (item.toName + '\r\n【' + item.toEmail + '】') : '',
        })
    )
}

/**
 * 解析查询参数
 * */
export function parseLocationSearch() {
    const searchStr = decodeURIComponent(location.search)
    const obj: any = {}
    if (searchStr) {
        const searchArr = searchStr.slice(1).split('&')
        searchArr.forEach(item => {
            const resArr = item.split('=')
            obj[resArr[0]] = resArr[1]
        })
    }
    return obj
}

/**
 * 获取本服务器上封面图相对路径
 * serverPath => /images/cover/xxx.xxx
 * */
export function getCoverRelativePath(url: string): string | undefined {
    const len = domainUrl.length
    // 是上传存储于本服务器上的图片
    if (url.includes(domainUrl)) {
        return url.substring(len)
    }
    return undefined
}
