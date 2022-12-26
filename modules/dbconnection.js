const mysql = require("mysql");
const dotenv = require("dotenv");

let instance = null;
dotenv.config();
  
console.log(process.env.HOST, process.env.USER, process.env.PASSWORD, process.env.DB_PORT)
let db_con  = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    port: process.env.DB_PORT
});
  
db_con.connect((err) => {
    if (err) {
      console.log("Database Connection Failed !!!", err);
    } else {
      console.log("connected to Database");
    }
});

class DbService {
  static getDbInstance()
  {
    return instance ? instance : new DbService();
  }

  async connectToDatabase(db) {
    try {
        const response = await new Promise((resolve, reject) => {   
            db_con  = mysql.createConnection({
                host: process.env.HOST,
                user: process.env.USER,
                password: process.env.PASSWORD,
                database:db,
                port: process.env.DB_PORT
            });
              
            db_con.connect((err) => {
                if (err) {
                  console.log("Database Connection Failed !!!", err);
                  reject(new Error(err.message));
                } else {
                  console.log("Connected to Database");
                  resolve(db_con);    
                }
            });
        });
        
        return response;
    } 
    catch(err)
    {
        console.log(err);
    }
  }


  async getDatabases() {
    try {
        const response = await new Promise((resolve, reject) => {
            const query = "SHOW DATABASES";

            db_con.query(query, (err, results) => {
                if (err) reject(new Error(err.message));
                resolve(results);
            })
        });
        console.log(response);
        return response;
    } catch (error) {
        console.log(error);
    }
  }

  async getTables(db_connection, db) {
    try {
        const response = await new Promise((resolve, reject) => {
            
            const query = "SHOW TABLES";
            db_connection.query(query, (err, results) => {
                if (err) reject(new Error(err.message));
                resolve(results);
            })
        });
        console.log(response);
        return response;
    } catch (error) {
        console.log(error);
    }
  }

  async db_query(db_connection, sql) {
    try {
        const response = await new Promise((resolve, reject) => {
            const query = sql;
            db_connection.query(query, (err, results) => {
                if (err) reject(new Error(err.message));
                resolve(results);
            })
        });
        console.log(response);
        return response;
    } catch (error) {
        console.log(error);
    }
  }

}
  
module.exports = DbService;