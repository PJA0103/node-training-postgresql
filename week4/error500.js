const headers = {
    "Access-Control-Allow-Headers": "Content-Type, Authorization, Content-Length, X-Request-With",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "PATCH, GET, POST, DELETE",
    "Content-Type": "application/json"
};

function error500(res){
    res.writeHead(500, headers)
    res.write(JSON.stringify({
      status: "error",
      message: "伺服器錯誤"
    }))
    res.end();
};

module.exports = error500;