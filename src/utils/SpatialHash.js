/**
 * SpatialHash
 * A simple grid-based spatial partitioning system to optimize collision detection.
 */
export class SpatialHash {
    constructor(cellSize = 300) {
        this.cellSize = cellSize;
        this.grid = new Map();
    }

    _hash(x, y) {
        const cx = Math.floor(x / this.cellSize);
        const cy = Math.floor(y / this.cellSize);
        return `${cx},${cy}`;
    }

    clear() {
        this.grid.clear();
    }

    insert(entity) {
        const pos = entity.components.Position;
        if (!pos) return;

        const col = entity.components.Collider;
        if (!col) {
            const key = this._hash(pos.x, pos.y);
            this._addToCell(key, entity);
            return;
        }

        // Calculate bounding box in world space
        let minX, minY, maxX, maxY;
        if (col.type === 'circle') {
            minX = pos.x - col.radius;
            minY = pos.y - col.radius;
            maxX = pos.x + col.radius;
            maxY = pos.y + col.radius;
        } else {
            const hw = col.width / 2;
            const hh = col.height / 2;
            // Simple AABB approximation for rotated rectangles
            const rot = entity.components.Rotation?.angle || 0;
            const cos = Math.abs(Math.cos(rot));
            const sin = Math.abs(Math.sin(rot));
            const width = col.width * cos + col.height * sin;
            const height = col.width * sin + col.height * cos;
            minX = pos.x - width / 2;
            minY = pos.y - height / 2;
            maxX = pos.x + width / 2;
            maxY = pos.y + height / 2;
        }

        // Insert into all overlapping cells
        const startX = Math.floor(minX / this.cellSize);
        const startY = Math.floor(minY / this.cellSize);
        const endX = Math.floor(maxX / this.cellSize);
        const endY = Math.floor(maxY / this.cellSize);

        for (let x = startX; x <= endX; x++) {
            for (let y = startY; y <= endY; y++) {
                const key = `${x},${y}`;
                this._addToCell(key, entity);
            }
        }
    }

    _addToCell(key, entity) {
        if (!this.grid.has(key)) {
            this.grid.set(key, []);
        }
        this.grid.get(key).push(entity);
    }

    getNearby(entity) {
        const pos = entity.components.Position;
        if (!pos) return [];

        const col = entity.components.Collider;
        let minX, minY, maxX, maxY;
        
        if (col) {
            if (col.type === 'circle') {
                minX = pos.x - col.radius;
                minY = pos.y - col.radius;
                maxX = pos.x + col.radius;
                maxY = pos.y + col.radius;
            } else {
                const rot = entity.components.Rotation?.angle || 0;
                const cos = Math.abs(Math.cos(rot));
                const sin = Math.abs(Math.sin(rot));
                const width = col.width * cos + col.height * sin;
                const height = col.width * sin + col.height * cos;
                minX = pos.x - width / 2;
                minY = pos.y - height / 2;
                maxX = pos.x + width / 2;
                maxY = pos.y + height / 2;
            }
        } else {
            minX = maxX = pos.x;
            minY = maxY = pos.y;
        }

        const startX = Math.floor(minX / this.cellSize);
        const startY = Math.floor(minY / this.cellSize);
        const endX = Math.floor(maxX / this.cellSize);
        const endY = Math.floor(maxY / this.cellSize);

        const results = new Set();
        for (let x = startX; x <= endX; x++) {
            for (let y = startY; y <= endY; y++) {
                const key = `${x},${y}`;
                const cell = this.grid.get(key);
                if (cell) {
                    cell.forEach(e => {
                        if (e !== entity) results.add(e);
                    });
                }
            }
        }
        return Array.from(results);
    }
}
