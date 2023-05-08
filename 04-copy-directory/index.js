
const fs = require('fs');
const path = require('path');

const sourceFolder = path.join(__dirname, './files');
const destinationFolder = path.join(__dirname, './files-copy');

// Создаем новую папку 'files-copy'
fs.mkdir(destinationFolder, { recursive: true }, (err) => {
  if (err) {
    console.error(err);
    return;
  }

  console.log(`Папка ${destinationFolder} создана`);

  // Получаем список файлов в папке 'files'
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

      // Копируем все файлы из папки 'Folder' в папку 'Folder-copy'
      files.forEach((file) => {
        const sourcePath = path.join(sourceFolder, file);
        const destinationPath = path.join(destinationFolder, file);

        fs.copyFile(sourcePath, destinationPath, (err) => {
          if (err) {
            console.error(err);
            return;
          }

          console.log(`Файл ${file} скопирован в ${destinationFolder}`);
        });
      });
    });
  });
});