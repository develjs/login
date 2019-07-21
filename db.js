/**
 * Wraper for MySQL DB
 */
const mysql = require('mysql');


/**
 * class MySQLDB()
 * 
 * @param {Object} config
 * @param {String} config.database - database name (required)
 * @param {String} config.host (default: localhost)
 * @param {String} config.user (default: root)
 * @param {String} config.password (default empty)
 * @param {Object} config.ssl - ssl object, ex: { ca : fs.readFileSync(__dirname + '/mysql-ca.crt') }
 * @param {Any} config.OTHERS - see here: https://github.com/mysqljs/mysql#user-content-connection-options
 */
module.exports = class MySQLDB {
    
    constructor(config) {
        this.config = Object.assign({
                host: process.env.DB_HOST ||'localhost',
                user: process.env.DB_USER ||'root',
                password: process.env.DB_PASSWORD ||'',
                database: process.env.DB_NAME ||'myschema',
                connectionLimit : 10
            }, config)
    }

    connect(){
        let connection = mysql.createConnection(this.config);
        return new Promise((resolve, reject) => {
            connection.connect(err => err? reject(err): resolve(connection));
        })
    }
    
    end(connection) {
        return new Promise((resolve,reject) => {
            if (!connection) resolve();
            else
                connection.end(err => err? reject(err): resolve());
        })
    }
    
    /**
     * Custom query
     * @param {String} sql
     * @return {Object}
     */
    query(sql) {
        let connection;
        return this.connect()
            .then(con => connection=con)
            .then(_ => new Promise((resolve,reject) => 
                connection.query(sql, (err, result) => 
                    (err? reject(err): resolve(result)))
            ))
            .then(
                res=>this.end(connection).then(_=>res),	// result will return if no errors
                err=>this.end(connection)				// query error return always
                    .then( 
                        _=>{ throw err }, 
                        _=>{ throw err } 
                    )
            )
    }
    
    /**
     * Custom select from any table
     * @param {String} name - table name
     * @param {Object} filter- filter params
     * @return {Object[]}
     */
    select(table, filter) {
        filter = var_list(filter, ' AND ');
        return this.query(`SELECT * FROM ${table}` + (filter? ` WHERE ${filter};`: ''));
    }
    
    /**
     * Add entity / table record
     * 
     * @param {String} table - table name
     * @param {Object} params 
     * @return {Integer} - inserted row id
     */
    insert(table, params){
        let fields = '', values = '';
        
        for (var p in params){
            fields += (fields?',':'') + p;
            values += (values?',':'') + value2str(params[p]);
        }
        
        return this.query(`INSERT INTO ${table} (${fields}) VALUES (${values});`)
            .then(data => data.insertId);
    }
    
    /**
     * Update entity / table record
     * 
     * @param {String} table - table name
     * @param {Object} params 
     * @param {Object} filter 
     */
    update(table, params, filter) {
        params = var_list(params);
        filter = var_list(filter, ' AND ');
        
        return this.query(`UPDATE ${table} SET ${params} WHERE ${filter}`);
    }
    
    /**
     * Delete 
     * 
     * @param {String} table - table name
     * @param {Object} filter 
     */
    remove(table, filter) {
        filter = var_list(filter, ' AND ');
        return this.query(`DELETE FROM ${table} WHERE ${filter};`);
    }
}

// stringify value, correct time format
function value2str(value) {
    if (value instanceof Date)
        value = value.toISOString().replace('T',' ').replace('Z','');
    return JSON.stringify(value)
}

function var_list(params, separator=',') {
    if (!params) return '';
        
    let result = [];
    for (var p in params) {
        result.push(p + (/[=<>]/.test(p)? '': '=') + value2str(params[p]));
    }
    
    return result.join(separator);
}