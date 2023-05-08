const path = require('path');
const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});


const writeToFile = (line) => {
  fs.appendFile(path.join(__dirname, 'text.txt'), line + '\n', (err) => {
    if (err) throw err;
  });
};

const askQuestion = () => {
  rl.question('Введите текст для добавления в файл: \n', (text) => {
    if (text === 'exit') {
      console.log('Три-Четыре Закончили');
      rl.close();
    } else {
      writeToFile(text);
      askQuestion();
    }
  });
};

rl.on('SIGINT', () => {
  console.log('Программа завершена');
  process.exit(0);
});

askQuestion();
