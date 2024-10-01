# Directory guide

## On Remote Repository:


**awn-language-server**: language server/client for AWN, VSCode extension.
**awn-documentation**: the material Peter gave me on AWN.  
**awn-syntax-highlighter**: AWN syntax highlighting VSCode extension, using a textmate grammar.  

## On Local Repository:

**awn-ide-nascent**: what is hopefully the beginning of the final project. I started a new 'bare minimum' theia project in here, not fully set up though. Will not come back to for a while I think.  
**theia-example**: the "theia IDE" that works in electron. I can probably delete this but kept it here for now just because it works - could be a reference later.
**vscode-extension-samples**: Contains VSCode extension samples (offical Microsoft, hosted at https://github.com/microsoft/vscode-extension-samples). I have cloned a subset of them:
- **lsp-sample** Example of a language server protocol.

# How to Run

Currently, the project consists of two major VSCode extensions, in `awn-language-server` and `awn-syntax-highlighter`. To run each of these:
1. Navigate to the respective directory
2. Run `npm install` to install necessary node.js modules (you will have to install npm if you don't have it)
3. Press F5 and VSCode will start an instance of the extension running in another process.