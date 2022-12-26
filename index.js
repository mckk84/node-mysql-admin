const express = require("express");
const app = express();
const cors = require("cors");
const cookieparser=require("cookie-parser")
const sessions=require("express-session");

app.set('view engine', 'ejs');
app.use(cookieparser());
const oneDay = 1000 * 60 * 60 * 24;
app.use(sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized:true,
    cookie: { maxAge: oneDay },
    resave: false 
}));

const dbConn = require('./modules/dbconnection');
const port = 8000;

let databases = [];
var session;

var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({
    extended: true,
  })
);

app.get("/", (req, res) => {
  session = req.session;
  session.destroy();
  const DbService = dbConn.getDbInstance();
  databases = DbService.getDatabases().then(databases => {
    session.databases = databases;
    const selectedDatabase = '';
    console.log('session:', session.databases);
    res.render("index", {databases:databases,selectedDatabase:selectedDatabase});
  }).catch(err => console.log(err));
  
});

app.get("/database", async (req, res) => 
{
  console.log('databases: ', req.query.db);
  session = req.session;
  session.database = req.query.db;
  let selectedDatabase = req.query.db;
  let tables = [];
  const DbService = dbConn.getDbInstance();

  await DbService.connectToDatabase(selectedDatabase).then(db_connection => {

      DbService.getTables(db_connection, selectedDatabase).then(tables => {

        if( session.databases )
        {
          databases = session.databases;
          console.log('databases', databases);
        }
        res.render("index", {databases:databases, selectedDatabase:selectedDatabase, tables:tables});

      }).catch(err => console.log(err));
    
  }).catch(err => console.log('Could not connect to Database'));
  
});

app.get("/table", async (req, res) => 
{
  session = req.session;
  if( typeof session.database == 'undefined' )
  {
    res.redirect('/');
  }
  let selectedDatabase = session.database;
  let table = req.query.table;
  let tableData = [];

  const DbService = dbConn.getDbInstance();
  await DbService.connectToDatabase(selectedDatabase).then(db_connection => {
      DbService.getTables(db_connection, selectedDatabase).then(tables => {
        if( session.databases )
        {
          databases = session.databases;
        }
        session.tables = tables;

        let sql = "SELECT * FROM "+table;
        
        DbService.db_query(db_connection, sql).then(tableData => {
            
            res.render("index", {
                databases:databases, 
                selectedDatabase:selectedDatabase, 
                tables:tables, 
                table:table,
                tableData: tableData 
              });
        }).catch(err => console.log(err));

      }).catch(err => console.log(err));
    
  }).catch(err => console.log('Could not connect to Database'));
  
  
});  

app.listen(port, () => {
  console.log(`NodeMyAdmin app listening at http://localhost:${port}`);
});