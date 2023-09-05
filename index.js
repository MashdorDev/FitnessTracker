const http = require('http');

const server = http.createServer( (req,res) =>{
    res.writeHead(200,{'Contect-type': 'text/plain'});
    res.end('Welcome to I love tuttles')

})

const PORT= 3000;

server.listen(PORT, () => {
    console.log(`server running on <http://localhost>:${PORT}`)
})