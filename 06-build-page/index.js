const fs = require('fs');
const path = require('path');
const templateHTML = path.join(__dirname, 'template.html');
const destinationFolder = path.join(__dirname, './project-dist');
const sourceFolder = path.join(__dirname, './components');

function createBundle(sourceFolder, destinationFolder) {
  // Создаем новую папку 'project-dist'
  fs.mkdir(destinationFolder, { recursive: true }, (err) => {
    if (err) {
      console.error(err);
      return;
    }
    // Получаем список файлов в папке 'components'
    fs.readdir(sourceFolder, (err, files) => {
      if (err) {
        console.error(err);
        return;
      }

      // Удаляем все файлы из папки 'files-copy'
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

        
      })
    })
  })
}



createBundle(sourceFolder, destinationFolder);
