const graphCanvas = document.getElementById("graphcanvas");
const graphCtx = graphCanvas.getContext("2d");

class Graph{
    constructor(size){
        this.size = size;
        this.isRunning = false;
        this.remake(size*3);
    }

    remake(maxEdges){
        if (this.isRunning) return;
        this.isRunning = true;
        this.nodes = Array.from({length: this.size}, () => ({
            x: Math.random()*550+25,
            y: Math.random()*550+25
        }));

        const allEdges = [];
        for(let i=0;i<this.size-1;i++){
            for(let j=i+1;j<this.size;j++){
                allEdges.push({
                    from:i,
                    to:j,
                    weight: Math.hypot(this.nodes[i].x-this.nodes[j].x, this.nodes[i].y-this.nodes[j].y)
                });
            }
        }

        const parent = Array.from({length:this.size}, (_, i)=>i);
        const find = x => parent[x]===x?x:(parent[x]=find(parent[x]));
        const merge = (a,b)=>{ a=find(a); b=find(b); if(a!==b) parent[b]=a; }
        const sorted = [...allEdges].sort((a,b)=>a.weight-b.weight);
        const usedEdges = [];
        for(const e of sorted){
            if(find(e.from)!==find(e.to)){
                merge(e.from,e.to);
                usedEdges.push(e);
            }
        }

        const remaining = maxEdges - usedEdges.length;
        if(remaining>0){
            const unused = allEdges.filter(e => !usedEdges.includes(e));
            for(let i=0;i<remaining && unused.length>0;i++){
                const idx = Math.floor(Math.random()*unused.length);
                usedEdges.push(unused[idx]);
                unused.splice(idx,1);
            }
        }

        this.edges = usedEdges;
        this.show();
        this.isRunning = false;
    }

    show(usedEdges = []){
        const ctx = graphCtx;
        clearCanvas(graphCanvas, ctx);

        ctx.strokeStyle = "gray";
        ctx.lineWidth = 1;
        for (const e of this.edges){
            const a = this.nodes[e.from];
            const b = this.nodes[e.to];
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
        }

        ctx.strokeStyle = "red";
        ctx.lineWidth = 3;
        for (const e of usedEdges){
            const a = this.nodes[e.from];
            const b = this.nodes[e.to];
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
        }

        for (let i = 0; i < this.nodes.length; i++){
            const n = this.nodes[i];
            ctx.fillStyle = "black";
            ctx.beginPath();
            ctx.arc(n.x, n.y, 5, 0, Math.PI*2);
            ctx.fill();
        }
    }

    async kruskal(){
        if (this.isRunning) return;
        this.isRunning = true;
        const parent = Array.from({length: this.size}, (_, i) => i);
        const find = x => {
            if (parent[x] === x) return x;
            return parent[x] = find(parent[x]);
        };
        const merge = (a, b) => {
            a = find(a);
            b = find(b);
            if (a !== b) parent[b] = a;
        };
        const same = (a, b) => find(a) === find(b);
        const sorted = [...this.edges].sort((a, b) => a.weight - b.weight);
        const usedEdges = [];

        for (const e of sorted){
            if (!same(e.from, e.to)){
                merge(e.from, e.to);
                usedEdges.push(e);
                this.show(usedEdges);
                await sleep(10);
            }
        }
        this.isRunning = false;
    }

    async dijkstra(start = 0, goal = null){
        if (this.isRunning) return;
        this.isRunning = true;

        const n = this.size;
        if (goal === null) goal = n-1;

        const dist = Array(n).fill(Infinity);
        const prev = Array(n).fill(null);
        const visited = Array(n).fill(false);
        dist[start] = 0;

        for (let iter = 0; iter < n; iter++){
            let u = -1;
            for (let i = 0; i < n; i++){
                if(!visited[i] && (u === -1 || dist[i] < dist[u])) u = i;
            }
            if (u === -1) break;
            visited[u] = true;

            this.show();
            const ctx = graphCtx;
            ctx.fillStyle = "limegreen";
            ctx.beginPath();
            ctx.arc(this.nodes[u].x, this.nodes[u].y, 5, 0, Math.PI*2);
            ctx.fill();
            await sleep(10);

            for (const e of this.edges){
                let to = null;
                if (e.from === u) to = e.to;
                else if (e.to === u) to = e.from;
                if (to === null) continue;

                const nd = dist[u] + e.weight;
                if (nd < dist[to]){
                    dist[to] = nd;
                    prev[to] = u;
                }
            }

            if (u === goal) break;
        }

        const pathEdges = [];
        let node = goal;
        while(prev[node] !== null){
            pathEdges.push({from: prev[node], to: node});
            node = prev[node];
        }

        this.show(pathEdges);
        this.isRunning = false;
    }
}

const graph = new Graph(100);
