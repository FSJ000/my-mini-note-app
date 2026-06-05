// tool.js - 最小可用的 Executa 工具
let input = '';
process.stdin.on('data', (chunk) => { input += chunk.toString(); });
process.stdin.on('end', () => {
  try {
    const request = JSON.parse(input);
    const { method, params, id } = request;
    
    let result;
    if (method === 'describe') {
      result = { description: "Summarize notes using simple rules" };
    } 
    else if (method === 'invoke') {
      const notes = (params && params.notes) ? params.notes : [];
      const count = notes.length;
      let summary = `共有 ${count} 条笔记。`;
      if (count === 0) summary = "暂无笔记";
      result = { summary };
    }
    else {
      throw new Error(`Method not found: ${method}`);
    }
    
    console.log(JSON.stringify({ jsonrpc: "2.0", result, id }));
  } catch (err) {
    console.log(JSON.stringify({ jsonrpc: "2.0", error: { code: -32603, message: err.message }, id: null }));
  }
});