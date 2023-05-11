const fs = require('fs');
const path = require('path');

const srcFolder = path.join(__dirname, './styles');
const destinationFolder = path.join(__dirname, './project-dist');


function streamMerge(srcFolder, destinationFolder) {
  // const storeFiles = fs.readdirSync(path.resolve(__dirname, srcFolder)); // Получить все файлы в каталоге исходных файлов

  // Получаем список файлов в папке 'Folder'
  fs.readdir(srcFolder, (err, files) => {
    if (err) {
      console.error(err);
      return;
    }

    console.log('work');
    
    // получаем список файлов  с расширением css
    let cssFiles = files.filter((file) => {
      // console.log(path.extname(file).slice(1));
      return path.extname(file).slice(1) === 'css';
    });
    // console.log(cssFiles);

    //проверить есть в наличии файл bundle.css
    fs.access(path.join(destinationFolder, 'bundle.css'), (error) => {
      if (error) {
        console.log('Файла нету');
        fs.writeFile(path.join(destinationFolder, 'bundle.css'), '', (err) => {
          if (err) {
            console.log('Создать файл bundle.css не получилось');
            console.log(err);
          } 
        });
      } else {
        console.log('Файл существует');
        fs.unlink(path.join(destinationFolder, 'bundle.css'), (err) => {
          if (err) {
            console.log('Удалить файл bundle.css не получилось');
            console.log(err);
          } else {
            console.log('Создание поcле удаления здесь');
            fs.writeFile(path.join(destinationFolder, 'bundle.css'), '', (err) => {
              if (err) {
                console.log('Создать файл bundle.css не получилось');
                console.log(err);
              }
            });
          }
        });
      }
      console.log('Едем дальше');
      const targetFile = path.join(destinationFolder, 'bundle.css');
      const fileWriteStream = fs.createWriteStream(targetFile); // Создаем доступный для записи поток
      
      streamMergeRecursive(cssFiles, srcFolder, fileWriteStream);
    });
  });
}


/**
   * Рекурсивный вызов слияния потока
 * @param { Array } styleFiles 
 * @param { String}  sourceFolder
 * @param { Stream } fileWriteStream
 */
function streamMergeRecursive(styleFiles = [], sourceFolder, fileWriteStream) {
  // Рекурсивно к оценке хвостовой ситуации
  if (!styleFiles.length) {
    return fileWriteStream.end('/*Слияние потока завершено*/'); // Наконец, закрываем доступный для записи поток, чтобы предотвратить утечку памяти
  }
  console.log('sourceFolder');
  console.log(sourceFolder);
  const currentFile = path.resolve(sourceFolder, styleFiles.shift());
  const currentReadStream = fs.createReadStream(currentFile); // Получить текущий читаемый поток

  currentReadStream.pipe(fileWriteStream, { end: false });
  currentReadStream.on('end', function () {
    streamMergeRecursive(styleFiles, sourceFolder, fileWriteStream);
  });

  currentReadStream.on('error', function (error) {// прослушивать события ошибок, закрывать доступный для записи поток и предотвращать утечки памяти
    console.error(error);
    fileWriteStream.close();
  });
}




module.exports = { streamMergeRecursive };
streamMerge(srcFolder, destinationFolder);




