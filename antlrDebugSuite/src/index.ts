
export {};
const axios = require('axios').default;
const fs = require('fs');
axios.defaults.baseURL = "http://localhost:8081";

const output = fs.readFileSync('/home/mycicle/git/rescribe/antlrDebugSuite/demoCode/java/SpellCheck.java');
function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms) );
}

axios.post('/processFile',
    {
        name:"SpellCheck.java",
        contents:output.toString()
    }
)
.then(
    console.log("posted")
)
// .then(
//     axios.get('/recentOutput').then((response:any) => {
//         console.log(response.data);
//         }
//     ))
    .catch((err:any) => {
    console.log(err.response.data);
});

// axios.get('/recentOutput').then((response:any) => {
//     console.log(response.data);

//     }).catch((err:any) => {
//         console.log(err.response.data);
//     } )
