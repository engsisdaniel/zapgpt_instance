import inquirer from 'inquirer';
import fs from 'fs';
import dotenv from 'dotenv';
import Axios from 'axios';

dotenv.config();

// const zapGptConnectUrl = 'http://local.zapgptconnect.com.br'
const zapGptConnectUrl = 'https://chat.digiital.com.br'

const AI_SELECTED = 'GPT';

const mainQuestion = [
  {
    type: 'list',
    name: 'AI_SELECTED',
    message: 'Escolha a IA que deseja usar:',
    choices: ['GPT'],
  },
];

const commonQuestions = [
  {
    type: 'input',
    name: 'MENSAGEM_PARA_ENVIAR_QUANDO_RECEBER_TIPO_DESCONHECIDO',
    default:
      'Eu ainda não consigo processar a mensagem que você mandou. Por favor, envie um texto.',
    message:
      'Informe a mensagem para quando receber uma mensagem de demais tipos (documento, localização, etc...) :',
  },
  {
    type: 'input',
    name: 'HORAS_PARA_REATIVAR_IA',
    message:
      'Informe o número de horas para a IA voltar a responder uma conversa depois que acontecer uma intervenção humana na conversa:',
    default: '24',
  },
  {
    type: 'input',
    name: 'SOMENTE_RESPONDER',
    message:
      'Caso não queira que a IA responda todos os contatos, digite aqui os números separados por virgula que ela deve responder: (exemplo: "555199284158, 559496817713")',
  },
  {
    type: 'input',
    name: 'NAO_RESPONDER',
    message:
      'Caso queira que a IA não responda números especificos, digite aqui os números separados por virgula que ela NÃO deve responder: (exemplo: "555199284158, 559496817713")',
  },
  {
    type: 'input',
    name: 'SEGUNDOS_PARA_ESPERAR_ANTES_DE_GERAR_RESPOSTA',
    message: 'Informe os segundos para esperar antes de gerar resposta:',
    default: '10',
  },
];

const geminiQuestion = [
  {
    type: 'input',
    name: 'GEMINI_KEY',
    message:
      'Informe a sua GEMINI_KEY (https://aistudio.google.com/app/apikey):',
    validate: (input) =>
      !!input ||
      'A GEMINI_KEY não pode ser vazia. Por favor, informe um valor válido.',
  },
  {
    type: 'input',
    name: 'GEMINI_PROMPT',
    message: 'Informe a seu prompt:',
  },
];

const gptQuestions = [
  {
    type: 'input',
    name: 'OPENAI_KEY',
    message: 'Informe a sua OPENAI_KEY (https://platform.openai.com/api-keys):',
    validate: (input) =>
      !!input ||
      'A OPENAI_KEY não pode ser vazia. Por favor, informe um valor válido.',
  },
  {
    type: 'input',
    name: 'OPENAI_ASSISTANT',
    message:
      'Informe o seu OPENAI_ASSISTANT (https://platform.openai.com/assistants):',
    validate: (input) =>
      !!input ||
      'O OPENAI_ASSISTANT não pode ser vazio. Por favor, informe um valor válido.',
  },
];

const lightsailQuestion = [
  {
    type: 'input',
    name: 'LIGHTSAIL_ID',
    message:
      'Informe o ID da instância LightSail:',
    validate: (input) =>
      !!input ||
      'O LIGHTSAIL_ID não pode ser vazio. Por favor, informe um valor válido.',
  },
];

const processCommonQuestions = async (envConfig) => {
  const commonAnswers = await inquirer.prompt(commonQuestions);
  Object.keys(commonAnswers).forEach((key) => {
    envConfig += `${key}="${commonAnswers[key]}"\n`;
  });
  return envConfig;
};

const initGPTEnvConfig = async (lightsailAnswers, envConfig) => {
  envConfig += `CONNECT_URL="${zapGptConnectUrl}"\nLIGHTSAIL_ID="${lightsailAnswers.LIGHTSAIL_ID}"\n`;

  try {
    const response = await Axios.get(`${zapGptConnectUrl}/api/getconfig/${lightsailAnswers.LIGHTSAIL_ID}`);

    const data = response.data.data;

    if (validateGPTConfig(data)) {
      envConfig += `OPENAI_KEY="${data.openai_key}"\nOPENAI_ASSISTANT="${data.openai_assistant}"\n`;

      commonQuestions.forEach((question) => {
        let answer;

        switch (question.name) {
          case 'MENSAGEM_PARA_ENVIAR_QUANDO_RECEBER_TIPO_DESCONHECIDO':
            answer = data.mensagem_demais_tipos;
            break;
          case 'HORAS_PARA_REATIVAR_IA':
            answer = data.horas_para_ia_voltar;
            break;
          case 'SOMENTE_RESPONDER':
            answer = data.responder_apenas ? data.responder_apenas : '';
            break;
          case 'NAO_RESPONDER':
            answer = data.nao_responder ? data.nao_responder : '';
            break;
          case 'SEGUNDOS_PARA_ESPERAR_ANTES_DE_GERAR_RESPOSTA':
            answer = data.segundos_para_resposta;
            break;
        }

        envConfig += `${question.name}="${answer}"\n`;
      });

      return envConfig;
    }

    return null;
  } catch (error) {
    console.error('### ERRO de conexão ao ZapGptConnect');
    console.error(error.message);
  }
}

const validateGPTConfig = (data) => {
  let isValid = true;

  if (!data.openai_key) {
    console.error('### ERRO na resposta do ZapGptConnect: openai_key vazio.');
    isValid = false;
  }

  if (!data.openai_assistant) {
    console.error('### ERRO na resposta do ZapGptConnect: openai_assistant vazio.');
    isValid = false;
  }

  if (!data.mensagem_demais_tipos) {
    console.error('### ERRO na resposta do ZapGptConnect: mensagem_demais_tipos vazio.');
    isValid = false;
  }

  if (!data.horas_para_ia_voltar) {
    console.error('### ERRO na resposta do ZapGptConnect: horas_para_ia_voltar vazio.');
    isValid = false;
  }

  if (!data.segundos_para_resposta) {
    console.error('### ERRO na resposta do ZapGptConnect: segundos_para_resposta vazio.');
    isValid = false;
  }

  return isValid;
}

let envConfig = `AI_SELECTED="${AI_SELECTED}"\n`;

if (AI_SELECTED === 'GEMINI') {
  const geminiAnswer = await inquirer.prompt(geminiQuestion);
  envConfig += `GEMINI_KEY="${geminiAnswer.GEMINI_KEY}"\nGEMINI_PROMPT="${geminiAnswer.GEMINI_PROMPT}"\n`;
  envConfig = await processCommonQuestions(envConfig);
} else {
  const lightsailAnswers = await inquirer.prompt(lightsailQuestion);
  envConfig = await initGPTEnvConfig(lightsailAnswers, envConfig);
}

if (envConfig) {
  fs.writeFileSync('.env', envConfig, { encoding: 'utf8' });
  console.log('Configuração salva com sucesso! 🎉');
}
