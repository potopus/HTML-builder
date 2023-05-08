const fs = require('fs');
const path = require('path');
const templateHTML = path.join(__dirname, 'template.html');
const destinationFolder = path.join(__dirname, './project-dist');
const sourceFolder = path.join(__dirname, './components');
const arrTempl = ['header', 'articles', 'footer'];
const templateVars = {
  '{{header}}': 'header.html',
  '{{articles}}': 'articles.html',
  '{{footer}}': 'footer.html',
};

function createBundle(sourceFolder, destinationFolder) {
  // Создаем новую папку 'project-dist'
  fs.mkdir(destinationFolder, { recursive: true }, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    // Получаем список файлов в папке 'components'
    fs.readdir(sourceFolder, (err, filesArr) => {
      if (err) {
        console.error(err);
        return;
      }
      // сортируем файлы по шаблону
      let sortFiles = sortArrFiles(filesArr, arrTempl);
      // Удаляем все файлы из папки 'project-dist'
      fs.readdir(destinationFolder, (err, destinationFiles) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log("Те самые файлы:" + destinationFiles);
        destinationFiles.forEach((file) => {
          const filePath = path.join(destinationFolder, file);
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(err);
              return;
            }
            console.log(`Файл ${path.parse(filePath).name} удален`);
          });
        });
        

        console.log("Отсортированные: " + sortFiles);
      })

    })
  })
}

function sortArrFiles(filesArr, arrTempl) {
  let sortFiles = [];
  arrTempl.forEach((elem) => {
    filesArr.forEach((file) => {
      if (file.includes(elem)) { sortFiles.push(file) }
    })
  })
  return sortFiles;
}



createBundle(sourceFolder, destinationFolder);
