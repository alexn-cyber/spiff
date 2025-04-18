function encodeDsl(str) {
    const utf8Bytes = new TextEncoder().encode(str);
    const binary = Array.from(utf8Bytes).map(b => String.fromCharCode(b)).join('');
    const base64 = btoa(binary);
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeDsl(base64url) {
    const base64 = base64url
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(base64url.length + (4 - base64url.length % 4) % 4, '=');
    const binary = atob(base64);
    const bytes = new Uint8Array([...binary].map(c => c.charCodeAt(0)));
    return new TextDecoder().decode(bytes);
}




function renderGraph(dsl) {

    // Basic sizings
    const circleRadius = 80;
    const gridSize = 220; // pixels per grid unit
    const arrowSize = 10; // controls marker size and offset


    // --- Compass direction deltas (x, y grid) ---
    const directions = {
        N: [0, -1],
        NE: [1, -1],
        E: [1, 0],
        SE: [1, 1],
        S: [0, 1],
        SW: [-1, 1],
        W: [-1, 0],
        NW: [-1, -1],
    };

    // --- Parse the DSL into edges ---
    const edges = dsl.trim().split("\n").map(line => {
        const attrMatch = line.match(/\[(.*)\]$/);
        const attrString = attrMatch ? attrMatch[1] : '';
        const attrs = Object.fromEntries(
            attrString
                .split(/\s+/)
                .filter(Boolean)
                .map(s => s.split('=').map(v => v.trim()))
        );

        const cleanLine = line.replace(/\[.*\]$/, '').trim();
        const parts = cleanLine.split(/-+>/).map(s => s.trim());

        const hyphenMatch = cleanLine.match(/(-+)>/);
        const distance = hyphenMatch ? hyphenMatch[1].length : 1;
        const [from, dir, to] = parts;

        return {
            from,
            dir,
            to,
            distance,
            ...attrs
        };
    });

    const nodePositions = {};
    const pending = [];

    // Pick an arbitrary starting node and origin position
    const startNode = edges[0].from;
    nodePositions[startNode] = [0, 0];
    pending.push(startNode);

    // BFS-like walk to assign positions
    while (pending.length > 0) {
        const current = pending.shift();
        const [x, y] = nodePositions[current];

        edges
            .filter(e => e.from === current)
            .forEach(({ dir, to, distance }) => {
                const delta = directions[dir];
                const scale = distance || 1;
                const newPos = [x + delta[0] * scale, y + delta[1] * scale];

                if (!(to in nodePositions)) {
                    nodePositions[to] = newPos;
                    pending.push(to);
                }
            });
    }

    console.debug('nodePositions', nodePositions);


    // Log parsed edges for verification
    console.debug('edges', edges);


    // Setup the actual graph
    // Compute the sizing of the canvas so we can center the graph in it
    const svg = document.getElementById("graph");
    if (!svg) return;
    if (svg.hasChildNodes()) {
        svg.innerHTML = '';
    }

    const xs = Object.values(nodePositions).map(([x, _]) => x);
    const ys = Object.values(nodePositions).map(([_, y]) => y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const graphWidth = (maxX - minX + 1) * gridSize;
    const graphHeight = (maxY - minY + 1) * gridSize;
    const canvasWidth = svg.clientWidth;
    const canvasHeight = svg.clientHeight;

    const offsetX = (canvasWidth - graphWidth) / 2 - minX * gridSize;
    const offsetY = (canvasHeight - graphHeight) / 2 - minY * gridSize;

    // Define an arrow
    const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");

    const marker = document.createElementNS("http://www.w3.org/2000/svg", "marker");
    marker.setAttribute("id", "arrow");
    marker.setAttribute("markerWidth", arrowSize.toString());
    marker.setAttribute("markerHeight", arrowSize.toString());
    marker.setAttribute("refX", (arrowSize / 2).toString());
    marker.setAttribute("refY", (arrowSize / 2).toString());
    marker.setAttribute("orient", "auto");
    marker.setAttribute("markerUnits", "strokeWidth");

    const markerStart = document.createElementNS("http://www.w3.org/2000/svg", "marker");
    markerStart.setAttribute("id", "arrow-start");
    markerStart.setAttribute("markerWidth", arrowSize.toString());
    markerStart.setAttribute("markerHeight", arrowSize.toString());
    markerStart.setAttribute("refX", (arrowSize / 2).toString());
    markerStart.setAttribute("refY", (arrowSize / 2).toString());
    markerStart.setAttribute("orient", "auto-start-reverse");
    markerStart.setAttribute("markerUnits", "strokeWidth");

    const pathStart = document.createElementNS("http://www.w3.org/2000/svg", "path");
    pathStart.setAttribute("d", `M0,0 L${arrowSize},${arrowSize / 2} L0,${arrowSize} Z`);
    pathStart.setAttribute("fill", "black");

    markerStart.appendChild(pathStart);
    defs.appendChild(markerStart);


    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", `M0,0 L${arrowSize},${arrowSize / 2} L0,${arrowSize} Z`);
    path.setAttribute("fill", "black");

    marker.appendChild(path);
    defs.appendChild(marker);
    svg.appendChild(defs);


    // Draw the vertexes
    Object.entries(nodePositions).forEach(([name, [gx, gy]]) => {
        const cx = gx * gridSize + offsetX;
        const cy = gy * gridSize + offsetY;

        // Draw node
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", cx);
        circle.setAttribute("cy", cy);
        circle.setAttribute("r", circleRadius);
        circle.setAttribute("fill", "white");
        circle.setAttribute("stroke", "black");
        svg.appendChild(circle);

        // Draw label
        const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
        label.setAttribute("x", cx);
        label.setAttribute("y", cy);
        label.setAttribute("text-anchor", "middle");
        label.setAttribute("dominant-baseline", "middle");
        const textSize = Math.min(12, circleRadius * 0.5)
        label.setAttribute("style", `font-size: ${textSize}px`);

        label.textContent = name;
        svg.appendChild(label);
    });

    // Draw the edges
    edges.forEach(({ from, to, curve, arrow }) => {
        const [fx, fy] = nodePositions[from];
        const [tx, ty] = nodePositions[to];

        const x1 = fx * gridSize + offsetX;
        const y1 = fy * gridSize + offsetY;
        const x2 = tx * gridSize + offsetX;
        const y2 = ty * gridSize + offsetY;

        // Compute unit direction vector
        const dx = x2 - x1;
        const dy = y2 - y1;
        const length = Math.sqrt(dx * dx + dy * dy);

        const ux = dx / length;
        const uy = dy / length;

        // Shorten start and end of the line by the circle radius + marker length
        const totalOffset = circleRadius + arrowSize;
        let extraStartOffset = 0;
        if (arrow === 'start' || arrow === 'both') {
            extraStartOffset = arrowSize;
        }
        const startX = x1 + ux * (circleRadius + extraStartOffset);
        const startY = y1 + uy * (circleRadius + extraStartOffset);
        const endX = x2 - ux * totalOffset;
        const endY = y2 - uy * totalOffset;

        let edgeEl;
        if (curve === 'up' || curve === 'down') {
            const curveFactor = circleRadius * 2; // control curvature
            const mx = (x1 + x2) / 2;
            const my = (y1 + y2) / 2;
            const bendY = curve === 'up' ? my - curveFactor : my + curveFactor;

            const d = `M ${startX} ${startY} Q ${mx} ${bendY} ${endX} ${endY}`;

            edgeEl = document.createElementNS("http://www.w3.org/2000/svg", "path");
            edgeEl.setAttribute("d", d);
            edgeEl.setAttribute("fill", "none");
        } else {
            edgeEl = document.createElementNS("http://www.w3.org/2000/svg", "line");
            edgeEl.setAttribute("x1", startX);
            edgeEl.setAttribute("y1", startY);
            edgeEl.setAttribute("x2", endX);
            edgeEl.setAttribute("y2", endY);
        }

        const arrowValue = (curve !== undefined && typeof curve === 'string') ? curve : null; // preserve if misparsed

        edgeEl.setAttribute("stroke", "black");
        edgeEl.setAttribute("stroke-width", "2");
        // Arrowhead logic
        switch (arrow) {
            case 'both':
                edgeEl.setAttribute("marker-start", "url(#arrow-start)");
                edgeEl.setAttribute("marker-end", "url(#arrow)");
                break;
            case 'start':
                edgeEl.setAttribute("marker-start", "url(#arrow-start)");
                break;
            case 'none':
                // No markers
                break;
            case 'end':
            default:
                edgeEl.setAttribute("marker-end", "url(#arrow)");
                break;
        }
        svg.appendChild(edgeEl);

    });

    // Add this once at the end
    const metadata = document.createElementNS("http://www.w3.org/2000/svg", "metadata");
    metadata.setAttribute("id", "dsl-source");
    metadata.textContent = "\n" + dsl;
    svg.appendChild(metadata);

    // Auto-fit graph to SVG canvas
    const bbox = svg.getBBox();
    svg.setAttribute("viewBox", `${bbox.x - 5} ${bbox.y - 5} ${bbox.width + 10} ${bbox.height + 10}`);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");


}

function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

document.getElementById("input").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.ctrlKey) {
        e.preventDefault();
        document.getElementById("renderButton").click();
    }
});

window.addEventListener("DOMContentLoaded", () => {
    let dslText = document.getElementById("input").value;
    const encodedDsl = getQueryParam("dsl");

    if (encodedDsl) {
        try {
            dslText = decodeDsl(encodedDsl);
            if (!/^[\w\s\-<>\n.,()'"&/]+$/g.test(dslText)) {
                throw new Error("DSL contains disallowed characters");
            }
            if (dslText.length > 10000) throw new Error("DSL too long");


            document.getElementById("input").value = dslText;
        } catch (e) {
            console.warn("Invalid DSL in query string", e);
        }
    }
    renderGraph(dslText);

    document.getElementById("renderButton").addEventListener("click", () => {
        const newDsl = document.getElementById("input").value;
        const encoded = encodeDsl(newDsl);
        const newUrl = `${window.location.pathname}?dsl=${encoded}`;
        history.pushState(null, '', newUrl); // update URL
        renderGraph(newDsl);
    });

});

window.addEventListener("popstate", () => {
    const encodedDsl = getQueryParam("dsl");
    if (encodedDsl) {
        try {
            const dslText = decodeDsl(encodedDsl);
            document.getElementById("input").value = dslText;
            renderGraph(dslText);
        } catch (e) {
            console.warn("Invalid DSL in popstate", e);
        }
    }
});

document.getElementById("downloadSvgButton").addEventListener("click", () => {
    const svg = document.getElementById("graph");

    // Clone and serialize the SVG node
    const clonedSvg = svg.cloneNode(true);
    clonedSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

    const svgText = new XMLSerializer().serializeToString(clonedSvg);

    // Create a Blob and a download link
    const blob = new Blob([svgText], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:T]/g, '-').split('.')[0];
    link.download = `node-graph-${timestamp}.svg`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url); // clean up
});

(function enableSvgResize() {
    const wrapper = document.getElementById("svgWrapper");
    const handle = document.getElementById("resizeHandle");

    let isDragging = false;
    let startX, startY, startWidth, startHeight;

    handle.addEventListener("mousedown", (e) => {
        e.preventDefault();
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = wrapper.offsetWidth;
        startHeight = wrapper.offsetHeight;
    });

    window.addEventListener("mousemove", (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        wrapper.style.width = `${startWidth + dx}px`;
        wrapper.style.height = `${startHeight + dy}px`;
    });

    window.addEventListener("mouseup", () => {
        isDragging = false;
    });
})();
