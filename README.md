# async concurrency control

# Usage
<pre> npm i throttle-lock --save </pre>

# Example
<pre>
const axios = requrie('axios');
const { throttleLock } = require('throttle-lock');

const get = throttleLock('get-request', axios.get, axios, 5, 20);

get(url1);
get(url2);
get(url3);
get(url4);
get(url5);
get(url6);
get(url7);
</pre>
