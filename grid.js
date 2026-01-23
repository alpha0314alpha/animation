const gridCanvas = document.getElementById("gridcanvas");
const gridCtx = gridCanvas.getContext("2d");
const dx = [1, 0, -1, 0];
const dy = [0, 1, 0, -1];

class Maze{
    constructor(){
        this.isRunning = false;
        this.size = 30;
        this.grid = matrix(this.size, this.size, false);
        this.remake();
    }

    remake(){
        if (this.isRunning) return;
        this.isRunning = true;
        while (true){
            for (let i = 0; i < this.size; i++){
                for (let j = 0; j < this.size; j++){
                    if (i == 0 && j == 0) this.grid[i][j] = false;
                    else if (i == this.size-1 && j == this.size-1) this.grid[i][j] = false;
                    else this.grid[i][j] = Math.random() < 0.4;
                }
            }

            const visited = matrix(this.size, this.size, false);
            const stack = [[0,0]];
            visited[0][0] = true;

            while (stack.length && !visited[this.size-1][this.size-1]){
                const [x, y] = stack.pop();
                for (let i = 0; i < 4; i++){
                    const nx = x+dx[i], ny = y+dy[i];
                    if (!this.isOut(nx, ny) && !this.grid[nx][ny] && !visited[nx][ny]){
                        visited[nx][ny] = true;
                        stack.push([nx, ny]);
                    }
                }
            }

            if (visited[this.size-1][this.size-1]) break;
        }
        this.show();
        this.isRunning = false;
    }

    show(visited = matrix(this.size, this.size, false)){
        const ctx = gridCtx;
        clearCanvas(gridCanvas, ctx);

        for (let i = 0; i < this.size; i++){
            for (let j = 0; j < this.size; j++){
                if (this.grid[i][j]) ctx.fillStyle = "gray";
                else if (visited[i][j]) ctx.fillStyle = "limegreen";
                else ctx.fillStyle = "black";
                ctx.fillRect(20*i, 20*j, 20, 20);
            }
        }
    }

    isOut(x, y){
        return x < 0 || this.size <= x || y < 0 || this.size <= y;
    }

    // DFS
    async dfs(){
        if (this.isRunning) return;
        this.isRunning = true;
        const visited = matrix(this.size, this.size, false);
        const stack = [[0,0]];
        visited[0][0] = true;
        this.show(visited);
        await sleep(10);

        while (stack.length && !visited[this.size-1][this.size-1]){
            const [x, y] = stack.pop();
            for (let i = 0; i < 4; i++){
                const nx = x+dx[i], ny = y+dy[i];
                if (!this.isOut(nx, ny) && !this.grid[nx][ny] && !visited[nx][ny]){
                    visited[nx][ny] = true;
                    stack.push([nx, ny]);
                    this.show(visited);
                    await sleep(10);
                }
            }
        }

        this.isRunning = false;
    }

    // BFS
    async bfs(){
        if (this.isRunning) return;
        this.isRunning = true;
        const ctx = gridCtx;
        const visited = matrix(this.size, this.size, false);
        const prev = matrix(this.size, this.size, null);
        const queue = [[0,0]];
        visited[0][0] = true;
        this.show(visited);
        await sleep(10);
        const gx = this.size-1, gy = this.size-1;
        while (queue.length && !visited[gx][gy]){
            const [x,y] = queue.shift();
            for (let i = 0; i < 4; i++){
                const nx = x+dx[i], ny = y+dy[i];
                if (this.isOut(nx,ny) || this.grid[nx][ny] || visited[nx][ny]) continue;
                visited[nx][ny] = true;
                prev[nx][ny] = [x,y];
                queue.push([nx,ny]);
                this.show(visited);
                await sleep(10);
            }
        }

        // 経路復元
        let px = gx, py = gy;
        while (prev[px][py] !== null){
            const [bx, by] = prev[px][py];
            ctx.fillStyle = "red";
            ctx.fillRect(20*px, 20*py, 20, 20);
            px = bx;
            py = by;
            await sleep(10);
        }

        ctx.fillStyle = "red";
        ctx.fillRect(0, 0, 20, 20);
        this.isRunning = false;
    }

    // A*
    async aster(){
        if (this.isRunning) return;
        this.isRunning = true;
        const ctx = gridCtx;
        const heuristic = (x, y) => Math.abs(x-(this.size-1)) + Math.abs(y-(this.size-1));

        const visited = matrix(this.size, this.size, false);
        const dist = matrix(this.size, this.size, Infinity);
        const prev = matrix(this.size, this.size, null);
        const gx = this.size-1, gy = this.size-1;
        const open = [[0,0]];
        dist[0][0] = 0;
        while (open.length && !visited[gx][gy]){
            open.sort((a,b)=>{
                const fa = dist[a[0]][a[1]] + heuristic(a[0],a[1]);
                const fb = dist[b[0]][b[1]] + heuristic(b[0],b[1]);
                return fa - fb;
            });

            const [x,y] = open.shift();
            if (visited[x][y]) continue;
            visited[x][y] = true;
            this.show(visited);
            await sleep(10);

            for (let i = 0; i < 4; i++){
                const nx = x+dx[i], ny = y+dy[i];
                if (this.isOut(nx,ny) || this.grid[nx][ny] || visited[nx][ny]) continue;

                const nd = dist[x][y] + 1;
                if (nd < dist[nx][ny]){
                    dist[nx][ny] = nd;
                    prev[nx][ny] = [x,y];
                    open.push([nx,ny]);
                }
            }
        }

        // 経路復元
        let px = gx, py = gy;
        while (prev[px][py] !== null){
            const [bx, by] = prev[px][py];
            ctx.fillStyle = "red";
            ctx.fillRect(20*px, 20*py, 20, 20);
            px = bx;
            py = by;
            await sleep(10);
        }

        ctx.fillStyle = "red";
        ctx.fillRect(0, 0, 20, 20);
        this.isRunning = false;
    }
}

const maze = new Maze();
