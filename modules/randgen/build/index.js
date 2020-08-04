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
function delegate() {
    return __awaiter(this, void 0, void 0, function* () {
        const { contractBuildPath, contractAddress, myAddress, contractFileName, contractName, ethereumEndpoint, } = yargs_1.argv;
        log('delegate(): contractBuildPath: %s, contractAddress: %s, myAddress: %s,'
            + 'contractFileName: %s, contractName: %s, ethereumEndpoint: %s', contractBuildPath, contractAddress, myAddress, contractFileName, contractName, ethereumEndpoint);
        const web3 = new web3_1.default();
        web3.setProvider(new web3_1.default.providers.WebsocketProvider(ethereumEndpoint));
        const { contracts } = JSON.parse(fs_1.default.readFileSync(contractBuildPath)
            .toString());
        const abi = contracts[contractFileName][contractName].abi;
        const contract = new web3.eth.Contract(abi, contractAddress);
        const delegated = yield contract.methods.requestDelegate(myAddress, 123).send({
            from: myAddress,
        });
        log('delegate(): delegated: %s', delegated);
    });
}
function work() {
    log('work()');
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        log('main(): argv: %j', yargs_1.argv);
        try {
            if (yargs_1.argv._.includes('work')) {
                work();
            }
            else if (yargs_1.argv._.includes('delegate')) {
                yield delegate();
            }
        }
        catch (err) {
            log('main(): error: %s', err);
        }
        return 0;
    });
}
if (require.main === module) {
    main();
}
