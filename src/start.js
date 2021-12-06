const http = require('http')
const fs = require('fs');

const queue = [];


const getResult = async (requestId, numbers) => {
    try {
        const options = {
            hostname: '35.189.216.103',
            port: 9005,
            path: `?request_id=${requestId}`,
            method: 'GET'
        }

        const req = http.request(options, res => {
            if (res.statusCode === 200) {
                res.on('data', d => {
                    process.stdout.write(d);
                    const data = JSON.parse(d.toString());

                    if (data.result) {
                        fs.writeFile('output.txt', `${data.result}\n`, function (err) {
                            if (err) return console.log(err);
                            console.log('result > output.txt');
                        });

                        if (queue.length > 0) {
                            const next = queue.shift();
                            startCalculation(next, numbers);
                        }
                    }
                })
            } else if (res.statusCode === 400) {
                calcResult(requestId);
            }
        })

        req.on('error', error => {
            console.error(error)
        })

        req.end()
    } catch (error) {
        console.error(error);
    }
};

const startCalculation = async (number, numbers) => {
    try {
        const options = {
            host: '35.189.216.103',
            port: '9005',
            method: 'POST'
        };
        const req = http.request(options, res => {
            if (res.statusCode === 200) {
                res.on('data', d => {
                    const data = JSON.parse(d.toString());
                    process.stdout.write(d);

                    if (data.request_id) {
                        calcResult(data.request_id, numbers, number);
                    }
                })
            } else if (res.statusCode === 430) {
                queue.push(parseInt(number));
            }
        })

        req.on('error', error => {
            console.error(error)
        })

        req.write(number)
        req.end()
    } catch (error) {
        console.error(error);
    }
};


const calcResult = (request_id, numbers) => {
    setTimeout(() => getResult(request_id, numbers), 5000)
};

const getFileData = async () => {
    try {
        const reader = fs.createReadStream('input.txt', {
            flag: 'a+',
            encoding: 'UTF-8',
            start: 5,
            end: 64,
            highWaterMark: 16
        });

        reader.on('data', function (chunk) {
            const numbers = chunk.split('\r\n');
            numbers.forEach((num) => startCalculation(num, numbers));
        });
    } catch (error) {
        console.error(error);
    }
};

getFileData();



