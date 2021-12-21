import { ethers } from 'ethers';
import { performance } from 'perf_hooks'

// SUA CHAVE PRIVADE DA METAMASK AQUI
const myPrivateKey = ""; 

// CONTRATO DO WBNB
const WBNB = "0xae13d989dac2f0debff460ac112a837c89baa7cd"; 
// CONTRATO DO BUSD
const BUSD = "0x78867BbEeF44f2326bF8DDd1941a4439382EF2A7";
// CONTRATO DO PANCAKE SWAP ROUTER
const router = "0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3";


// BSC TESTNET NODE
const provider = new ethers.providers.JsonRpcProvider('https://data-seed-prebsc-1-s1.binance.org:8545/');

// INSTÂNCIA DA CARTEIRA
const wallet = new ethers.Wallet(myPrivateKey);

// ASSINATURA DO PROVEDOR
const signer = wallet.connect(provider);


// FUNÇOES E ASSINATURA DO PANCAKE SWAP CONTRACT
const routerContract = new ethers.Contract(
    router,
    [
        'function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)',
        'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline)',
        'function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)',
        'function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)'
    ],
    signer
);


// FUNÇAO PARA TROCAR WBNB POR BUSD
async function main() {
    // QUANTIDADE DE BNB A SER NEGOCIADA
    const amountIn = ethers.utils.parseUnits('0.02', 'ether'); 

    // CALCULANDO A QUANTIDADE MINIMA DE BUSD RETORNADO NA TROCA
    const amounts = await routerContract.getAmountsOut(amountIn, [BUSD, WBNB]);

    // VALOR MINIMO DE BUSD RETORNADO NA TROCA CONVERTIDO PARA BIG NUMBER
    const amountOutMin = amounts[1].sub(amounts[1].div(10));
 

    // MARCANDO INICIO DA TRANSAÇÃO PARA DEBUG
    const timeStart = performance.now();
   

    // INICIANDO OPERAÇÃO DE SWAP DOS PARES DE TOKENS WBNB PARA BUSD
    const swapTx = await routerContract.swapExactETHForTokens(
        amountOutMin, // VALOR MÍNIMO DE BUSD
        [WBNB, BUSD], // ARRAY COM OS PARES DAS MOEDAS 
        wallet.address, // ENDEREÇO DA CARTEIRA
        Date.now() + 1000 * 60 * 10, // TEMPO MÁXIMO PERMITIDO PARA TRANSAÇÃO
        {
            gasPrice: ethers.utils.parseUnits('300', 'gwei').toString(), // VALOR DO GÁS
            gasLimit: 950000, // GÁS LIMIT
            value: amountIn // VALOR DE WBNB
        } 
    ) 

    //AO TERMINAR TRANSAÇÃO ESSE EVENTO SERÁ CHAMADO MONSTRANDO OS LOGS COM O TEMPO DE DURAÇÃO E OS DADOS DA TRANSAÇÃO
    provider.once(swapTx.hash, (transaction) => {
        const timeEnd = performance.now();
        console.log(transaction);
        console.log("Transaction finished once in " + Math.floor((timeEnd - timeStart) / 1000) + " seconds.");
    });
}
 
main().then().finally(() => {}); 
