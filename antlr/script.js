// process.argv.forEach(function(val, index, array) {
//     console.log(index + ": " + val);
// })

//cd src/grammer/ && 
//java -Xmx500M -cp \"/usr/local/lib\/antlr-4.7.1-complete.jar:$CLASSPATH\" org.antlr.v4.Tool Hello.g4 -o gen
// && cd gen && 
//javac Hello*.java && java -Xmx500M -cp \"/usr/local/lib/antlr-4.7.1-complete.jar:$CLASSPATH\" org.antlr.v4.gui.TestRig Hello r -tree -gui 
//&& ./run.sh

const execSync = require('child_process').execSync;
const run_dir = process.cwd();
var argv = require('minimist')(process.argv.slice(2));
console.dir(argv);

execSync("cd " + argv["grammer-dir"] + " && java -Xmx500M -cp \"/usr/local/lib\/antlr-4.7.1-complete.jar:$CLASSPATH\" org.antlr.v4.Tool " + argv["grammer-name"] + " -o " + argv["output-folder"] + " && cd " + argv["output-folder"] + " && ls && javac " + argv["grammer-name"].split('.')[0] + "*" + ".java", { encoding : 'utf-8' });
console.log("Output files generated - use grun to run antlr\n");

