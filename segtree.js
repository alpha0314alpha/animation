const segtreeCanvas = document.getElementById("segtreecanvas");
const segtreeCtx = segtreeCanvas.getContext("2d");

class SegTree {
    constructor(n, e, operator) {
        this.n = n;
        this.e = e;
        this.operator = operator;
        this.isRunning = false;
        this.size = 1;
        while (this.size < n) this.size <<= 1;
        this.seg = new Array(this.size*2).fill(e);
        const levels = Math.log2(this.size)+1;
        this.cellW = segtreeCanvas.width/this.size;
        this.cellH = segtreeCanvas.height/levels;
    }

    reset(){
        this.seg = Array(this.size*2).fill(this.e);
        this.show()
    }
    
    show(){
        const ctx = segtreeCtx;
        clearCanvas(segtreeCanvas, ctx);
        const levels = Math.log2(this.size) + 1;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        for (let i = 0; i < levels; i++){
            const segWidth = this.size >> i;
            const y = i * this.cellH;

            for (let l = 0; l < this.size; l += segWidth){
                const idx = (1<<i)+(l/segWidth);
                if (idx === this.active) ctx.fillStyle = "#ffcc66";
                else ctx.fillStyle = Math.floor(l/segWidth)%2? "#bbb": "#ddd";
                ctx.fillRect(l*this.cellW, y, segWidth*this.cellW, this.cellH);
                ctx.strokeStyle = "#888";
                ctx.strokeRect(l*this.cellW, y, segWidth*this.cellW, this.cellH);
                ctx.fillStyle = "#000";
                
                let val = this.seg[idx];
                if (val <= -1e7) val = "-INF";
                else if (val >= 1e7) val = "INF";
                ctx.fillText(val, (l+segWidth/2)*this.cellW, y+this.cellH/2);
            }
        }
    }

    async update(pos, val){
        if (this.isRunning) return;
        this.isRunning = true;

        let i = pos+this.size;
        this.seg[i] = val;
        this.active = i;
        this.show();
        await sleep(100);

        while (i > 1){
            i >>= 1;
            this.seg[i] = this.operator(
                this.seg[i<<1],
                this.seg[i<<1|1]
            );
            this.active = i;
            this.show();
            await sleep(100);
        }

        this.active = -1;
        this.show();
        this.isRunning = false;
    }

    inputSegtree(){
        const idx = Number(document.getElementById("segtree-idx").value)-1;
        const val = Number(document.getElementById("segtree-val").value);
        if (idx < 0 || idx >= this.n) return;
        if (Number.isNaN(idx) || Number.isNaN(val)) return;
        this.update(idx, val);
    }
}

const segtree_size = 8;
const segtree_sum = new SegTree(segtree_size, 0, (x, y) => x+y);
const segtree_max = new SegTree(segtree_size, -1e9, (x, y) => Math.max(x, y));
let currentSeg = segtree_sum;
currentSeg.show();
