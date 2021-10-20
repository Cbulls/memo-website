module.exports = {
    HTML: function (title, list, body, control){
      return `
      <!doctype html>
      <html>
      <head>
        <title>희윤위키 - ${title}</title>
        <meta charset="utf-8">
      </head>
      <body>
        <h1><a href="/">메모장</a></h1>
        ${list}
        ${body}
      </body>
      <footer>
      ${control}
      </footer>
      </html>
      `;
      }, 
      List: function(filelist){
      var list = '<ol>';
      var i = 0;
      while(i < filelist.length){
        list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
        i = i + 1;
      }
      list = list +'</ol>';
      return list;
    }
  };