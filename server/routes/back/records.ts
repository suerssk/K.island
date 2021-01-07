import express from 'express'
import { addRecord, deleteRecord, queryRecordList, updateRecord } from '../../services/recordService'
import { writeHead, writeResult } from '../../utils/writeResponse'
import {verifyTokenResponse} from "../../utils/util";

const router = express.Router()

// 查询文章列表
router.get('/list', (req, res) => {
    verifyTokenResponse(req, res, () => {
        queryRecordList({
            ...req.body,
            range: 'all'
        }, result => {
            writeHead(res, 200)
            res.write(writeResult(true, '查询成功！', result))
            res.end()
        }, err => {
            writeHead(res, 500)
            res.write(writeResult(false, '文章列表查询失败咯~', err))
            res.end()
        })
    })
})

// 新增文章
router.post('/add', (req, res) => {
    verifyTokenResponse(req, res, () => {
        addRecord(req.body, result => {
            writeHead(res, 200)
            res.write(writeResult(true, '文章上传成功！', result))
            res.end()
        }, err => {
            writeHead(res, 500)
            res.write(writeResult(false, '哇哦~ 文章上传失败啦！去看看哪里出问题了吧', err))
            res.end()
        })
    })
})

// 修改文章详情
router.put('/update', (req, res) => {
    verifyTokenResponse(req, res, () => {
        updateRecord(req.body, result => {
            writeHead(res, 200)
            res.write(writeResult(true, '文章修改成功啦！', result))
            res.end()
        }, err => {
            writeHead(res, 500)
            res.write(writeResult(false, '哇哦~ 文章修改失败啦！', err))
            res.end()
        })
    })
})

// 删除文章
router.delete('/delete', (req, res) => {
    verifyTokenResponse(req, res, () => {
        deleteRecord(req.body, result => {
            writeHead(res, 200)
            res.write(writeResult(true, '文章删除成功！', result))
            res.end()
        }, err => {
            writeHead(res, 500)
            res.write(writeResult(false, '哇哦~ 文章删除失败！', err))
            res.end()
        })
    })
})

export default router