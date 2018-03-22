'use strict';

const fs = require('fs');
const express = require('express');

const bodyParser = require('body-parser');
const PORT = process.env.PORT || 3000;
const app = express();

const pg = require('pg');
// Windows and Linux users: You should have retained the user/password from the pre-work for this course.
// Your OS may require that your conString is composed of additional information including user and password.
const conString = 'postgres://postgres:ibanez84@localhost:5432/postgres';

// Mac:
// const conString = 'postgres://localhost:5432';

const client = new pg.Client(conString);

// REVIEW: Use the client object to connect to our DB.
client.connect();


// REVIEW: Install the middleware plugins so that our app can use the body-parser module.
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('./public'));


// REVIEW: Routes for requesting HTML resources
app.get('/new', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // GET is the read portion of CRUD. this is a request and response to the server, i.e. #2 & #5 on the diagram. This is reading a route for new HTML to /new HTML where we are creating a new blog article to be added to our blog page. It is tied to the submit event in new.html which utilizes the articleView.create function.
  response.sendFile('new.html', { root: './public' });
});


// REVIEW: Routes for making API calls to use CRUD Operations on our database
app.get('/articles', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // This is a Read from CRUD. This is #3 and #4 because this method is a GET for query with a result from the database. The results are all of the articles. This method allows .fetchAll() to have something to grab from the database. The .fetchAll() pulls the 'results' from the Database and passes them into .loadAll() in order to display the articles on index.html.
  client.query('SELECT * FROM articles;')
    .then(function(result) {
      response.send(result.rows);
    })
    .catch(function(err) {
      console.error(err)
    })
});

app.post('/articles', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // This is a Create from CRUD. This is an AJAX request to add data to the database. It is a request to add all the articles to the database. This corresponds to #3 on the diagram because it takes the request from the server and creates new data to update the database. This is not directly affected by article.js however linked by the event handler for the submit on new.html.
  client.query(
    `INSERT INTO
    articles(title, author, "authorUrl", category, "publishedOn", body)
    VALUES ($1, $2, $3, $4, $5, $6);
    `, [
      request.body.title,
      request.body.author,
      request.body.authorUrl,
      request.body.category,
      request.body.publishedOn,
      request.body.body
    ]
  )
    .then(function() {
      response.send('insert complete')
    })
    .catch(function(err) {
      console.error(err);
    });
});

app.put('/articles/:id', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // This is an Update from CRUD. This corresponds to #3 and #4 because this a response to a new article object being created by the submit event in new.html. It triggers the .updateRecord() method from article.js which at this current time is not being called, but has been created in anticipation of future functionality. However, we are able to call this request from the console to see it in action.
  client.query(
    `UPDATE articles SET title=$1, author=$2, "authorUrl"=$3, category=$4, "publishedOn"=$5, body=$6 WHERE article_id=$7;`, [      
      request.body.title,
      request.body.author,
      request.body.authorUrl,
      request.body.category,
      request.body.publishedOn,
      request.body.body,
      request.params.id]
  )
    .then(() => {
      response.send('update complete')
    })
    .catch(err => {
      console.error(err);
    });
});

app.delete('/articles/:id', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // This is a Delete (or destroy) of CRUD. This is sending a query to the database and then deleting a specific article from it. This is reflected by #3 & #4 in the diagram. This corresponds to the deleteRecord() function in articlejs, which is currently not called anywhere, but available to be called using console.log
  client.query(
    `DELETE FROM articles WHERE article_id=$1;`, [request.params.id]
  )
    .then(() => {
      response.send('Delete complete')
    })
    .catch(err => {
      console.error(err);
    });
});

app.delete('/articles', (request, response) => {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // This is a Delete (or destroy) of CRUD. This is sending a query to the database and then truncating all articles from it. This is reflected by #3 & #4 in the diagram. This corresponds to the truncateTable() function in articlejs, which is currently not called anywhere, but available to be called using console.log
  client.query(
    `DELETE FROM articles;`
  )
    .then(() => {
      response.send('Delete complete')
    })
    .catch(err => {
      console.error(err);
    });
});

// COMMENT: What is this function invocation doing?
// This function is declared below and makes a query to check if there is a table that exists, and creates the table if it does not. It then calls the loadArticles() function which will populate the table information with all articles.
loadDB();

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}!`);
});


//////// ** DATABASE LOADER ** ////////
////////////////////////////////////////
function loadArticles() {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // This line corresponds with sections 3 and 4 of the full-stack-diagram, as it is making a query to the database and then having the results sent back. This function is called by the loadDB() function which then will build the database for use by the fetchAll() function from article.js. This corresponds to Post in CRUD, as this acts as a way to build the database.
  client.query('SELECT COUNT(*) FROM articles')
    .then(result => {
      // REVIEW: result.rows is an array of objects that PostgreSQL returns as a response to a query.
      // If there is nothing on the table, then result.rows[0] will be undefined, which will make count undefined. parseInt(undefined) returns NaN. !NaN evaluates to true.
      // Therefore, if there is nothing on the table, line 158 will evaluate to true and enter into the code block.
      if (!parseInt(result.rows[0].count)) {
        fs.readFile('./public/data/hackerIpsum.json', 'utf8', (err, fd) => {
          JSON.parse(fd).forEach(ele => {
            client.query(`
              INSERT INTO
              articles(title, author, "authorUrl", category, "publishedOn", body)
              VALUES ($1, $2, $3, $4, $5, $6);
            `, [ele.title, ele.author, ele.authorUrl, ele.category, ele.publishedOn, ele.body])
          })
        })
      }
    })
}

function loadDB() {
  // COMMENT: What number(s) of the full-stack-diagram.png image correspond to the following line of code? Which method of article.js is interacting with this particular piece of `server.js`? What part of CRUD is being enacted/managed by this particular piece of code?
  // This is a Create from CRUD, as when we find that a table does not exist, we will be building the table skeleton with the parameters being requested. Once the table is created, it takes in the values that are populated using the hackerIpsum file which is read in the loadArticles() function and builds the database from that. This corresponds to sections 3 and 4 of the diagram, as we are requesting and passing information from the server and the database.
  client.query(`
    CREATE TABLE IF NOT EXISTS articles (
      article_id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      author VARCHAR(255) NOT NULL,
      "authorUrl" VARCHAR (255),
      category VARCHAR(20),
      "publishedOn" DATE,
      body TEXT NOT NULL);`)
    .then(() => {
      loadArticles();
    })
    .catch(err => {
      console.error(err);
    });
}