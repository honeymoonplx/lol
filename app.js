const { createBot, createProvider, createFlow, addKeyword, EVENTS } = require('@bot-whatsapp/bot');
const axios = require('axios');
const QRPortalWeb = require('@bot-whatsapp/portal');
const BaileysProvider = require('@bot-whatsapp/provider/baileys');
const MockAdapter = require('@bot-whatsapp/database/mock');


async function getChatGPTResponse(inputText) {

    try {
        const response = await axios.post(
          'https://chatgpt-best-price.p.rapidapi.com/v1/chat/completions',
          {
            model: 'gpt-3.5-turbo',
            messages: [
                { "role": "system", "content": "Eres DevBot, un bot amigable." },
                { "role": "user", "content": inputText }
              ],     
            },
          {
            headers: {
                'X-RapidAPI-Host': 'chatgpt-best-price.p.rapidapi.com', 
                'X-RapidAPI-Key': '92fba87daamsha4d155a2066f0e2p140c61jsnabf10fe1aca3', 
                'content-type': 'application/json'
            },
          }
        );
    
        const chatGPTResponse = response.data.choices[0].message.content;   
        console.log("llegamos a la respuesta:" + chatGPTResponse)
        return chatGPTResponse;
      } catch (error) {
        console.error('Error calling ChatGPT API:', error);
        return 'Error en la solicitud a la API de ChatGPT.';
      }
}

const flowDiscord = addKeyword(['discord','Discord','DISCORD'])
.addAnswer(['Únete al discord donde tenemos variedad de interacciones!!','https://discord.gg/DNzHnxaah9'])


const flowBot = addKeyword(['chatbot','Chatbot','CHATBOT','ChatBot'])
    .addAnswer("¡Hola, hola! ¿Cual es tu pregunta? 🗣️",
    {capture:true},
    async (ctx, { flowDynamic }) => {
        const respuestaChatGPT = await getChatGPTResponse(ctx.body);
        return flowDynamic(respuestaChatGPT)
    }
   
    )
    .addAnswer("¡DevBot se fue.., Para hacerle otra pregunta al loro, llamalo con el comando DevBot 🗣️")

const flowPrincipal = addKeyword(EVENTS.WELCOME)
    .addAnswer('🙌 Hola bienvenido a *DevBot*')
    .addAnswer(
        [
            'Te comparto los siguientes comandos de interes sobre el proyecto:',
            '🖤 ```chatbot``` 🖤             Para hablar con la IA',
            '🖤 ```discord``` 🖤             Para unirte al discord',
            '🖤 ```imagenes-ia``` 🖤    Proximamente....',

        ],
    )


const main = async () => {
    const adapterDB = new MockAdapter();
    const adapterFlow = createFlow([flowBot, flowDiscord, flowPrincipal]);
    const adapterProvider = createProvider(BaileysProvider);

    createBot({
        flow: adapterFlow,
        provider: adapterProvider,
        database: adapterDB,
    });

    QRPortalWeb();
};

main();
