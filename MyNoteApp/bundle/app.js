// 存储笔记的数组
let notes = [];

// 从 localStorage 加载已保存的笔记
function loadNotes() {
    const saved = localStorage.getItem('mini-notes');
    if (saved) {
        notes = JSON.parse(saved);
        renderNotes();
    }
}

// 保存笔记到 localStorage
function saveNotesToStorage() {
    localStorage.setItem('mini-notes', JSON.stringify(notes));
}

// 渲染笔记列表
function renderNotes() {
    const container = document.getElementById('notesContainer');
    if (notes.length === 0) {
        container.innerHTML = 'No notes';
        return;
    }

    // 按添加顺序显示，最新的在最上面
    const html = notes.map((note, idx) => `
        <div class="note-item">
            <span>${escapeHtml(note.content)} <small>(${note.timestamp})</small></span>
            <button class="delete-btn" data-idx="${idx}">Delete</button>
        </div>
    `).join('');
    container.innerHTML = html;

    // 添加删除按钮事件
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(btn.dataset.idx);
            notes.splice(idx, 1);
            saveNotesToStorage();
            renderNotes();
        });
    });
}

// 简单的防XSS处理
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// 保存笔记按钮事件
document.getElementById('saveBtn').addEventListener('click', () => {
    const input = document.getElementById('noteInput');
    const content = input.value.trim();
    if (!content) {
        alert('Please enter a note');
        return;
    }
    notes.unshift({
        content: content,
        timestamp: new Date().toLocaleString()
    });
    saveNotesToStorage();
    renderNotes();
    input.value = '';
});

// 通过 JSON-RPC over stdio 调用本地工具
async function invokeTool(toolPath, method, params) {
    const { spawn } = await import('child_process');
    
    return new Promise((resolve, reject) => {
        const process = spawn('node', [toolPath]);
        
        let output = '';
        process.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        process.stderr.on('data', (data) => {
            console.error('Tool error:', data.toString());
        });
        
        process.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Tool exited with code ${code}`));
                return;
            }
            
            try {
                const response = JSON.parse(output);
                if (response.error) {
                    reject(new Error(response.error.message));
                } else {
                    resolve(response.result);
                }
            } catch (err) {
                reject(new Error('Failed to parse tool response'));
            }
        });
        
        // 发送 JSON-RPC 请求
        const request = JSON.stringify({
            jsonrpc: '2.0',
            id: Date.now(),
            method: method,
            params: params
        });
        
        process.stdin.write(request);
        process.stdin.end();
    });
}

// Summarize 按钮事件 - 调用 Executa 工具
document.getElementById('summarizeBtn').addEventListener('click', async () => {
    const summaryDiv = document.getElementById('summaryResult');
    summaryDiv.innerHTML = 'Processing...';

    try {
        // 调用本地工具
        const result = await invokeTool('./executas/summarize/tool.js', 'invoke', { notes: notes });
        summaryDiv.innerHTML = result.summary || "No summary available";
    } catch (err) {
        console.error(err);
        summaryDiv.innerHTML = `Error: ${err.message}`;
    }
});

// 页面加载时加载笔记
loadNotes();
