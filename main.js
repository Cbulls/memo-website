var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var path = require('path');
var sanitizeHtml = require('sanitize-html');

var template = require('./template.js');

var app = http.createServer(function(request,response){
    var reqUrl = request.url;
    var queryData = url.parse(reqUrl, true).query;
    var pathname = url.parse(reqUrl, true).pathname;
    if(pathname === '/'){
      if(queryData.id === undefined){
        fs.readdir('./data', (error, filelist) =>{
          var title = '인사말';
          var description = `개발자 황희윤이 만든 메모장으로 어느 누구나 정보를 업로드, 수정, 삭제 할 수 있습니다.`;
          var list = template.List(filelist);
          var html = template.HTML(title, list, `<h2>${title}</h2><p>${description}</p>`,
          `<p><a href = "/create">create</a></p>
          <p><a href="/update?id=${title}">update</a></p>
          <form action = 'delete_process' method='post'><input type='hidden' name='id' value='${title}'><input type='submit' value='삭제'>
          </form>`);
          response.writeHead(200);
          response.end(html);
        });
 
      } else {
        fs.readdir('./data', (error, filelist) => {
          var filteredId = path.parse(queryData.id).base;
          var filteredId = path.parse(queryData.id).base;
          fs.readFile(`data/${filteredId}`, 'utf8', (err, description) => {
            var title = queryData.id;
            var sanitizedTitle = sanitizeHtml(title);
            var sanitizedDescription = sanitizeHtml(description);
            var list = template.List(filelist);
            var html = template.HTML(sanitizedTitle, list, `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`, 
            `<p><a href = "/create">create</a></p>
            <p><a href="/update?id=${sanitizedTitle}">update</a></p> \n\
            <form action = 'delete_process' method='post'><input type='hidden' name='id' value='${sanitizedTitle}'><input type='submit' value='삭제'>
            </form>`)
            response.writeHead(200);
            response.end(html);
          });
        });
      }
    } else if(pathname === '/create'){
      fs.readdir('./data', 'utf8', (error, filelist) =>{
        var title = '인사말';
        var description = `개발자 황희윤이 만든 메모장으로 어느 누구나 정보를 업로드, 수정, 삭제 할 수 있습니다.`;
        var list = template.List(filelist);
        var html = template.HTML(title, list, `<form action="/create_process" method = "post">
        <p><input type="text" name = "title" placeholder="title"></p>
        <p>
            <textarea name="description" cols="20" rows="10" placeholder = "description"></textarea>
        </p>
        <p>
            <input type="submit">
        </p>
    </form>`,'');
        response.writeHead(200);
        response.end(html);
      });
    } else if (pathname === '/create_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
          // Too much POST data, kill the connection
          // 1e6 = 1* Math.pow(10, 6) = 1000000 = 1MB
          // if (body.length>1e6){
          //   request.connection.destroy
          // };
        });
        request.on('end', function(){
            var post = qs.parse(body);
            console.log(post.description)
            var title = post.title;
            var description = post.description
            fs.writeFile(`./data/${title}`, description, 'utf8', (err) => {
              response.writeHead(302, {location : encodeURI(`/?id=${title}`)}); //수정하고 나면 수정 된 페이지로 돌아감.
              response.end();
            })
        });
      
    } else if (pathname === '/update'){
      fs.readdir('./data', 'utf8', (error, filelist) => {
        var list = template.List(filelist);
        var filteredId = path.parse(queryData.id).base;
        fs.readFile(`data/${filteredId}`, 'utf8', (err, description) => {
          var title = queryData.id;
          var sanitizedTitle = sanitizeHtml(title);
          var sanitizedDescription = sanitizeHtml(description);
          var html = template.HTML(title, list, 
          `<form action="/update_process" method = "post">
          <input type ="hidden" name= "id" value="${sanitizedTitle}">
          <p><input type="text" name = "title" placeholder="title" value="${sanitizedTitle}"></p>
          <p>
              <textarea name="description" cols="20" rows="10" placeholder = "description">${sanitizedDescription}</textarea>
          </p>
          <p>
              <input type="submit">
          </p>
      </form>`, `<p><a href = "/create">create</a></p><p><a href="/update?id=${sanitizedTitle}">update</a></p>`)
          response.writeHead(200);
          response.end(html);
        });
      });
    } else if (pathname === '/update_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
        });
        request.on('end', function(){
            var post = qs.parse(body);
            console.log(post.description)
            var title = post.title; // new file
            var id = post.id // old file
            var description = post.description
            fs.rename(`data/${id}`,`data/${title}`, function(err){
              fs.writeFile(`./data/${title}`, description, 'utf8', (err) => {
                response.writeHead(302, {location : encodeURI(`/?id=${title}`)}); //수정하고 나면 수정 된 페이지로 돌아감.
                response.end();
              })
            })
        });
    } else if (pathname === '/delete_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
        });
        request.on('end', function(){
            var post = qs.parse(body);
            var id = post.id;
            var filteredId = path.parse(id).base;
            fs.unlink(`./data/${filteredId}`, (err) => {
              response.writeHead(302, { location : '/'}); //삭제하고 나면 메인으로 감
              response.end();
            });
        });
      } else {
      response.writeHead(404);
      response.end('Not found');
    }
 
 
 
});

// Difference between readFileSync and just readFile
// console.log('A');
// var B = fs.readFileSync('/Users/heeyun/code/sample.txt','utf8');
// console.log(B);
// console.log('C');

// console.log('A');
// fs.readFile('code/sample.txt','utf8',(err,data)=>{
//   console.log(data)
// });
// console.log('C');

app.listen(3000);

