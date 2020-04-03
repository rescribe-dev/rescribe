// process.argv.forEach(function(val, index, array) {
//     console.log(index + ": " + val);
// })

//cd src/grammer/ && 
//java -Xmx500M -cp \"/usr/local/lib\/antlr-4.7.1-complete.jar:$CLASSPATH\" org.antlr.v4.Tool Hello.g4 -o gen
// && cd gen && 
//javac Hello*.java && java -Xmx500M -cp \"/usr/local/lib/antlr-4.7.1-complete.jar:$CLASSPATH\" org.antlr.v4.gui.TestRig Hello r -tree -gui 
//&& ./run.sh

const execSync = require('child_process').execSync;
// const output = execSync('ls', { encoding : 'utf-8' });
// console.log('Output was ', output);
const run_dir = process.cwd();
var argv = require('minimist')(process.argv.slice(2));
console.dir(argv);

execSync("cd " + argv["grammer-dir"] + " && java -Xmx500M -cp \"/usr/local/lib\/antlr-4.7.1-complete.jar:$CLASSPATH\" org.antlr.v4.Tool " + argv["grammer-name"] + " -o " + argv["output-folder"] + " && cd " + argv["output-folder"] + " && ls && javac " + argv["grammer-name"].split('.')[0] + "*" + ".java", { encoding : 'utf-8' });
// console.log("javac " + argv["grammer-name"].split('.')[0] + "*" + ".java");
// const output = execSync("java -Xmx500M -cp \"/usr/local/lib/antlr-4.7.1-complete.jar:$CLASSPATH\" org.antlr.v4.gui.TestRig " + argv["grammer-name"].split('.')[0] + " r -tree -gui && cd -", { encoding : 'utf-8' });
// const output = execSync("cat " + argv["grammer-path"], { encoding : 'utf-8' })
// console.log("Output was : ", argv["grammer-path"]);
console.log("Output files generated - use grun to run antlr\n");

// execSync(" cd -", { encoding : 'utf-8' });
