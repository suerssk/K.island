import mysql from 'mysql2'
import Query from 'mysql2/typings/mysql/lib/protocol/sequences/Query'

export function createConnection () {
    return mysql.createConnection({
        host: "127.0.0.1",
        port: 3306,
        user: "root",
        password: "xxx",
        database: "k_island"
    });
}

export function connectQuery (
    sqlStr: string,
    params: any[],
    success: (result: any) => void,
    error: (err: Query.QueryError) => void
) {
    const connection = createConnection()
    connection.connect()
    connection.query(sqlStr, params, ((err: any, result: any) => {
        if (!err) {
            success(result)
        } else {
            error(err)
        }
    }))
    connection.end()
}

export function connectQueryPro (
    sqlStr: string,
    params: any[]
) {
    return new Promise((resolve, reject) => {
        const connection = createConnection()
        connection.connect()
        connection.query(sqlStr, params, ((err: any, result: any) => {
            if (!err) {
                resolve(result)
            } else {
                reject(err)
            }
        }))
        connection.end()
    })
}
