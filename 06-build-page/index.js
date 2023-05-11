const fsp = require('fs/promises');
const fs = require('fs');
const path = require('path');
const templateHTML = path.join(__dirname, 'template.html');
const destinationFolder = path.join(__dirname, './project-dist');
const sourceFolder = path.join(__dirname, './components');
const cssFolder = path.join(__dirname, './styles');
const assetsFolder = path.join(__dirname, './assets');
const assetsDestinationFolder = path.join(destinationFolder, './assets');

const arrTempl = ['header', 'main', 'footer'];



async function createBundle(sourceFolder, destinationFolder) {
  // await fsp.rm(destinationFolder, {recursive:true, force: true})
  // Создаем новую папку 'project-dist'
  await fsp.mkdir(destinationFolder, { recursive: true });
  // Удаляем все файлы из папки 'project-dist'
  await clearFolder(destinationFolder);


  // Получаем список файлов в папке 'components'
  let filesHTML = await fsp.readdir(sourceFolder);




  console.log('Удаление выполнено работаем дальше: ');



  // собираем файл html
  // прочитать файл template.html в переменную
  let data = await fsp.readFile(templateHTML, 'utf8');

  console.log('Сборка HTML');
  // Получить список переменных
  const templateVars = getVarsFromComponentsFolder(filesHTML);
  // создаю цикл для чтения файла из каталога components

  const fileData = {};
  for (const filename of filesHTML) {
    try {
      const data = await fsp.readFile(path.join(sourceFolder, filename), 'utf-8');
      const key = filename.replace(/\..+$/, ''); // получаем имя файла без расширения
      fileData[key] = data; // добавляем данные файла в объект
    } catch (err) {
      console.error(`Error reading file: ${filename}`);
      throw err;
    }
  }
  // console.log(fileData);
  filesHTML.forEach((fileHtml) => {
    console.log('цикл чтения файлов html');
    // читаю файл tempFile и записываю его в переменную varCode
    // readFileIntoVariable(path.join(sourceFolder, tempFile))
    // const tempFile = await fsp.readFile(path.join(sourceFolder,fileHtml), 'utf8');
    // получить нужный шаблон, согласно используемого файла
    // console.log(tempFile);
    const key = fileHtml.replace(/\..+$/, ''); // получаем имя файла без расширения
    let temple = templateVars[fileHtml];
    let regexp = new RegExp(`${temple}`, 'g');
    // заменяю шалон {{...}} на текст из соответствующего файла
    data = data.replace(`{{${key}}}`, `\n${fileData[key]}`);

  })
  await fsp.writeFile(path.join(destinationFolder, './index.html'), data);
  // if (result.includes('!DOCTYPE')) {
  //   writeFileFromVariable(path.join(destinationFolder, './index.html'), result)
  // }
  // console.log(data);




  console.log('CSS ');
  // получаем-читаем список файлов из папки styles
  let files = await fsp.readdir(cssFolder);
  // сортирую файлы CSS по шаблону
  let sortStyleFiles = sortArrFiles(files, arrTempl);
  console.log (sortStyleFiles);
  // добавляю слияание, как в 5 задании
  const targetFile = path.join(destinationFolder, 'style.css');
  const fileWriteStream = fs.createWriteStream(targetFile); // Создаем доступный для записи поток
  // добавляю импортированную функцию
  await streamMergeRecursive(sortStyleFiles, cssFolder, fileWriteStream);



  console.log('copy folder');
  copyFolder(assetsFolder, assetsDestinationFolder).catch(error => console.error(error));



}

async function writeFileFromVariable(filePath, data) {

  await fsp.writeFile(filePath, data);

}

function getVarsFromComponentsFolder(filesHTML) {
  let objectVars = {};
  const nameRegex = /^.*(?=\..*)/;
  for (const file of filesHTML) {
    const name = file.match(nameRegex)[0];
    objectVars[file] = `{{${name}}}`;
  }
  return objectVars;
}

async function copyFolder(source, destination) {
  try {
    // создаю папку для копирования файлов в целевой сборочной папке
    await fs.promises.mkdir(destination, { recursive: true });
    // читаю то что находится в ресурсной папке на первом уровне
    const files = await fs.promises.readdir(source, { withFileTypes: true });
    // копирую файлы и папки с вызовом рекурсии
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

  const result = await fsp.readFile(filePath, 'utf8');
  return result;

}


async function clearFolder(folderPath) {
  console.log('работает удаление');
  const files = await fsp.readdir(folderPath); // читаем содержимое папки
  for (const file of files) {
    const filePath = path.join(folderPath, file); // получаем полный путь к файлу/папке
    const stat = await fsp.stat(filePath); 
    if (stat.isDirectory()) { 
      await clearFolder(filePath); // рекурсивно вызываем clearFolder для удаления содержимого
      await fsp.rm(filePath, { recursive: true, force: true }); // удаляем пустую папку
    } else { 
      await fsp.unlink(filePath); // удаляем файл
    }
  }
}

function sortArrFiles(filesArr, arrTempl) {
  let sortFiles = [];
  // arrTempl.forEach((elem) => {
  //   filesArr.forEach((file) => {
  //     if (file.includes(elem)) { sortFiles.push(file); }
  //   });
  // });
  filesArr.sort((a, b) => {
    if (a === 'header.css') {
      return -1;
    }
    if (b === 'header.css') {
      return 1;
    }
    return 0;
  });
  return filesArr;
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
