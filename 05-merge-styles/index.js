const fs = require('fs');
const path = require('path');

const sourceFolder = path.join(__dirname, './styles');
const destinationFolder = path.join(__dirname, './project-dist');


function streamMerge(sourceFolder, destinationFolder) {
  // const storeFiles = fs.readdirSync(path.resolve(__dirname, sourceFolder)); // Получить все файлы в каталоге исходных файлов

  // Получаем список файлов в папке 'Folder'
  fs.readdir(sourceFolder, (err, files) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log("work");
    // получаем список файлов  с расширением css
    let cssFiles = files.filter((file) => {
      // console.log(path.extname(file).slice(1));
      return path.extname(file).slice(1) === 'css';
    })
    // console.log(cssFiles);
   
    //проверить есть в наличии файл bundle.css
    fs.access(path.join(destinationFolder, "bundle.css"), (error) => {
      if (error) {
        console.log("Файла нету");
        fs.writeFile(path.join(destinationFolder, "bundle.css"), '', (err) => {
          if (err) {
            console.log("Создать файл bundle.css не получилось");
            console.log(err);
          } else {

          }

        })
      } else {
        console.log("Файл существует");
        fs.unlink(path.join(destinationFolder, "bundle.css"), (err) => {
          if (err) {
            console.log("Удалить файл bundle.css не получилось");
            console.log(err);
          } else {
            console.log("Создание поcле удаления");
            fs.writeFile(path.join(destinationFolder, "bundle.css"), '', (err) => {
              if (err) {
                console.log("Создать файл bundle.css не получилось");
                console.log(err);
              }
            })
          }
        })
      }
      console.log("Едем дальше")
      const targetFile = path.join(destinationFolder, "bundle.css");
      const fileWriteStream = fs.createWriteStream(targetFile); // Создаем доступный для записи поток
      streamMergeRecursive(cssFiles, fileWriteStream);
    })
  })
}


/**
   * Рекурсивный вызов слияния потока
 * @param { Array } styleFiles 
 * @param { Stream } fileWriteStream
 */
function streamMergeRecursive(styleFiles = [], fileWriteStream) {
  // Рекурсивно к оценке хвостовой ситуации
  if (!styleFiles.length) {
    return fileWriteStream.end("console.log ('Слияние потока завершено')"); // Наконец, закрываем доступный для записи поток, чтобы предотвратить утечку памяти
  }

  const currentFile = path.resolve(sourceFolder, styleFiles.shift());
  const currentReadStream = fs.createReadStream(currentFile); // Получить текущий читаемый поток

  currentReadStream.pipe(fileWriteStream, { end: false });
  currentReadStream.on('end', function () {
    streamMergeRecursive(styleFiles, fileWriteStream);
  });

  currentReadStream.on('error', function (error) {// прослушивать события ошибок, закрывать доступный для записи поток и предотвращать утечки памяти
    console.error(error);
    fileWriteStream.close();
  });
}





streamMerge(sourceFolder, destinationFolder);




