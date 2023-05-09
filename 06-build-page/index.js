const fs = require('fs');
const fsp = require('fs').promises;
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

      // Удаляем все файлы из папки 'project-dist'
      clearFolder(destinationFolder).catch(console.error);
    })

    // собираем файл html
    

  })
}



async function clearFolder(folderPath) {
  console.log(folderPath);
  const files = await fsp.readdir(folderPath); // читаем содержимое папки
  for (const file of files) {
    const filePath = path.join(folderPath, file); // получаем полный путь к файлу/папке
    const stat = await fsp.stat(filePath); // получаем информацию о файле/папке
    if (stat.isDirectory()) { // если это папка
      await clearFolder(filePath); // рекурсивно вызываем clearFolder для удаления содержимого
      await fsp.rmdir(filePath); // удаляем пустую папку
    } else { // если это файл
      await fsp.unlink(filePath); // удаляем файл
    }
  }
}




createBundle(sourceFolder, destinationFolder);
