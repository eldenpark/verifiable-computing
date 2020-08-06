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
const yargs_1 = require("yargs");
const fs_1 = __importDefault(require("fs"));
const server_1 = require("jege/server");
const web3_1 = __importDefault(require("web3"));
const log = server_1.logger('[randgen]');
function getContract(ethereumEndpoint, contractBuildFilePath, contractFileName, contractName, contractAddress) {
    const web3 = new web3_1.default();
    web3.setProvider(new web3_1.default.providers.WebsocketProvider(ethereumEndpoint));
    const { contracts } = JSON.parse(fs_1.default.readFileSync(contractBuildFilePath)
        .toString());
    const abi = contracts[contractFileName][contractName].abi;
    const contract = new web3.eth.Contract(abi, contractAddress);
    return contract;
}
function delegate(opts) {
    return __awaiter(this, void 0, void 0, function* () {
        const { contractBuildFilePath, contractAddress, myAddress, contractFileName, contractName, ethereumEndpoint, } = opts;
        log('delegate(): contractBuildPath: %s, contractAddress: %s, myAddress: %s,'
            + 'contractFileName: %s, contractName: %s, ethereumEndpoint: %s', contractBuildFilePath, contractAddress, myAddress, contractFileName, contractName, ethereumEndpoint);
        const contract = getContract(ethereumEndpoint, contractBuildFilePath, contractFileName, contractName, contractAddress);
        const delegated = yield contract.methods.requestDelegate(myAddress, 123)
            .send({ from: myAddress });
        log('delegate(): delegated: %j', delegated);
    });
}
function work(opts) {
    const { contractBuildFilePath, contractAddress, myAddress, contractFileName, contractName, ethereumEndpoint, } = opts;
    log('work(): contractBuildFilePath: %s, contractAddress: %s, myAddress: %s,'
        + 'contractFileName: %s, contractName: %s, ethereumEndpoint: %s', contractBuildFilePath, contractAddress, myAddress, contractFileName, contractName, ethereumEndpoint);
    const contract = getContract(ethereumEndpoint, contractBuildFilePath, contractFileName, contractName, contractAddress);
    contract.events.RoundSetup().on('data', (e) => {
        console.log('event handler', e);
    });
}
(function main() {
    return __awaiter(this, void 0, void 0, function* () {
        log('main(): argv: %j', yargs_1.argv);
        try {
            if (yargs_1.argv._.includes('work')) {
                work(yargs_1.argv);
            }
            else if (yargs_1.argv._.includes('delegate')) {
                delegate(yargs_1.argv);
            }
        }
        catch (err) {
            log('main(): error: %s', err);
        }
        return 0;
    });
})();
