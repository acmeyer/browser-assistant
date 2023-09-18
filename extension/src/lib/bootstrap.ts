// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Window {
  dynamicScriptExecutor: (code: string) => void;
}

window.dynamicScriptExecutor = function (code: string) {
  eval(code);
};
