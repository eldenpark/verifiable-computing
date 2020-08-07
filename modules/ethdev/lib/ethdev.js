"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deploy = void 0;
const web3_1 = __importDefault(require("web3"));
const server_1 = require("jege/server");
const log = server_1.logger('[ethdev]');
function deploy(contractBuildFilePath, endpoint, contractFileName, contractName) {
    return __awaiter(this, void 0, void 0, function* () {
        const { contracts } = require(contractBuildFilePath);
        log('deploy(): ethereum endpoint: %s', endpoint);
        const web3 = new web3_1.default();
        web3.setProvider(new web3_1.default.providers.WebsocketProvider(endpoint));
        const [acc1, acc2, acc3, ...accounts] = yield web3.eth.getAccounts();
        const contractFile = contracts[contractFileName];
        const abi = contractFile[contractName].abi;
        const code = contractFile[contractName].evm.bytecode.object;
        const contract = new web3.eth.Contract(abi);
        const payload = { data: code };
        const con = yield contract.deploy(payload).send({
            from: acc2, gas: 6721975, gasPrice: '20000000000',
        });
        log('deploy(): Rand deployed, at address: %s', con.options.address);
        return {
            con,
            web3,
        };
    });
}
exports.deploy = deploy;
