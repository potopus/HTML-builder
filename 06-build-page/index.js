const fs = require('fs');
const fsp = require('fs').promises;
const path = require('path');
const templateHTML = path.join(__dirname, 'template.html');
const destinationFolder = path.join(__dirname, './project-dist');
const sourceFolder = path.join(__dirname, './components');
const cssFolder = path.join(__dirname, './styles');
const assetsFolder = path.join(__dirname, './assets');
const assetsDestinationFolder = path.join(destinationFolder, './assets');

const arrTempl = ['header', 'main', 'footer'];
const templateVars = {
  'header.html': '{{header}}',
  'articles.html': '{{articles}}',
  'footer.html': '{{footer}}'
};


async function createBundle(sourceFolder, destinationFolder) {
  // Создаем новую папку 'project-dist'
   fs.mkdir(destinationFolder, { recursive: true }, (err) => {
    if (err) {
      console.error(err);
      return;
    }

    // Получаем список файлов в папке 'components'
    fs.readdir(sourceFolder, (err, filesHTML) => {
      if (err) {
        console.error(err);
        return;
      }

      // Удаляем все файлы из папки 'project-dist'
      clearFolder(destinationFolder).then(() => {

        console.log("Удаление выполнено работаем дальше: ")


        // собираем файл html
        // прочитать файл template.html в переменную
        fs.readFile(templateHTML, 'utf8', (err, data) => {
          if (err) {
            console.error(err);
            return;
          }
          console.log("Сборка HTML");
          // создаю цикл для чтения файла из каталога components

          for (let tempFile of filesHTML) {
            // получить нужный шаблон, согласно используемого файла
            let temple = templateVars[tempFile];

            // читаю файл tempFile и записываю его в переменную varCode
            // console.log("Путь к файлу:  " + path.join(sourceFolder, tempFile) + "   ::  шаблон:  " + temple);
            readFileIntoVariable(path.join(sourceFolder, tempFile)).then(function (result) {
              // console.log("result");
              // console.log(result);
              let regexp = new RegExp(`${temple}`, 'g');
              // console.log( data);
              // заменяю шалон {{...}} на текст из соответствующего файла
              data = data.replace(regexp, `\n${result}`);
              if (temple === "{{header}}") { console.log(data) };
              return data
            }).then( (result)=>{
              writeFileFromVariable(path.join(destinationFolder, './index.html'), result).then(() => {
                console.log('File successfully written.');
              }).catch((err) => {
                console.error(`Error writing file: ${err}`);
              });
            });
          }
          // console.log(data);

        })
      }).then(() => {
        console.log('CSS');
        // получаем-читаем список файлов из папки styles
        fs.readdir(cssFolder, (err, files) => {
          if (err) {
            console.error(err);
            return;
          }
          console.log('вход  в readdir 06');
          // сортирую файлы CSS по шаблону
          let sortStyleFiles = sortArrFiles(files, arrTempl);
          console.log(sortStyleFiles);
          // добавляю слияание, как в 5 задании
          const targetFile = path.join(destinationFolder, 'style.css');
          const fileWriteStream = fs.createWriteStream(targetFile); // Создаем доступный для записи поток
          // добавляю импортированную функцию
          console.log('Добавление в файл styles' + cssFolder);
          streamMergeRecursive(sortStyleFiles, cssFolder, fileWriteStream);
        });
      }
      ).then(() => {
        console.log('copy folder');
        copyFolder(assetsFolder, assetsDestinationFolder).catch(error => console.error(error));

      }).catch(console.error);
    });
  });
}

async function writeFileFromVariable(filePath, data) {
  try {
    await fsp.writeFile(filePath, data);
  } catch (err) {
    throw err;
  }
}


async function copyFolder(source, destination) {
  try {
    // добавляем регулярное выражения для получения папки в которой находится рессурс для копирования
    // var nameSourceFolder = source.match(/^.*\\([^\\]+)$/)[1];//получить имя assets
    // сздаю путь в целевую для сборки
    // let folderToSaveSource = path.join(destination, nameSourceFolder);
    // создаю папку для копирования файлов в целевой сборочной папке
    await fs.promises.mkdir(destination, { recursive: true });
    // function copyData ()
    // читаю то что находится в ресурсной папке на первом уровне
    const files = await fs.promises.readdir(source, { withFileTypes: true });
    // копирую файлы и 
    for (const file of files) {
      const sourcePath = `${source}/${file.name}`;
      const destinationPath = `${destination}/${file.name}`;
      if (file.isDirectory()) {
        await copyFolder(sourcePath, destinationPath);
      } else {
        await fs.promises.copyFile(sourcePath, destinationPath);
      }
    }
    console.log('Folder copied successfully.');
  } catch (err) {
    console.error(`Error copying folder: ${err}`);
  }
}

async function readFileIntoVariable(filePath) {
  try {
    const result = await fsp.readFile(filePath, 'utf8');
    // console.log(result);
    return result;
  } catch (err) {
    throw err;
  }
}


async function clearFolder(folderPath) {
  // console.log(folderPath);
  console.log("работает удаление");
  const files = await fsp.readdir(folderPath); // читаем содержимое папки
  for (const file of files) {
    const filePath = path.join(folderPath, file); // получаем полный путь к файлу/папке
    const stat = await fsp.stat(filePath); // получаем информацию о файле/папке
    if (stat.isDirectory()) { // если это папка
      await clearFolder(filePath); // рекурсивно вызываем clearFolder для удаления содержимого
      console.log("Удаляем папку::  " + filePath)
      await fsp.rm(filePath, { recursive: true, force: true }); // удаляем пустую папку
    } else { // если это файл
      await fsp.unlink(filePath); // удаляем файл
    }
  }
}

function sortArrFiles(filesArr, arrTempl) {
  let sortFiles = [];
  arrTempl.forEach((elem) => {
    filesArr.forEach((file) => {
      if (file.includes(elem)) { sortFiles.push(file); }
    });
  });
  return sortFiles;
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
    return fileWriteStream.end('/* слияние завершено */'); // Наконец, закрываем доступный для записи поток, чтобы предотвратить утечку памяти
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



createBundle(sourceFolder, destinationFolder);
