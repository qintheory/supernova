var width = window.innerWidth,
    height = window.innerHeight;
    
var canvas = d3.select("body")
            .append("canvas")
            .attr("width", width)
            .attr("height", height),
    context = canvas.node().getContext("2d"),
    width = window.innerWidth,
    height = window.innerHeight;

var radius = d3.scaleSqrt().range([1, 3])
//    color = d3.scaleOrdinal()
//            .domain(["C", "O", "N", "H"])
//            .range(["steelblue", "steelblue", "steelblue", "steelblue"]),
    transform = d3.zoomIdentity;
    
canvas.width = width; 
canvas.height = height;
context.width = width;
context.height = height; 

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().distance(function(d) { return radius(d.source.size*0.1) + radius(d.target.size*0.1); }))
    .force("charge", d3.forceManyBody().strength(-100))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("forceX", d3.forceX().strength(.1).x(width * .5));
//    .force("forceY", d3.forceY().strength(.1).y(height * .5));
//const graph = await d3.json("data/graph.json");
////console.log(graph);
//update();

d3.json("data/graph.json").then(function(graph) {
    
  var nodes = graph.nodes, 
      links = graph.links,
      colors = nodes.color;

  simulation
      .nodes(nodes)
      .on("tick", ticked);

  simulation.force("link")
      .links(links);

  canvas.call(d3.drag()
          .subject(dragsubject)
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended))
        .call(d3.zoom().scaleExtent([-5, 2])
          .on("zoom", zoomed))
        .call(render);

  function ticked() {
    context.clearRect(0, 0, width, height);
    context.beginPath();
    links.forEach(drawLink);
    context.beginPath();
    nodes.forEach(drawNode);
  }

  function dragsubject(event) {
    return simulation.find(event.x, event.y);
  }

  function zoomed(event) {
    transform = event.transform;
    render();
  }
    
  function render() {
      context.save();
      context.clearRect(0, 0, width, height);
      context.beginPath();
      context.translate(transform.x, transform.y);
      context.scale(transform.k, transform.k);
      links.forEach(drawLink);
      nodes.forEach(drawNode);
      context.fill();
      context.restore();
    }       
});


function dragstarted(event) {
  if (!event.active) simulation.alphaTarget(0.3).restart();
  event.subject.fx = event.subject.x;
  event.subject.fy = event.subject.y;
}

function dragged(event) {
  event.subject.fx = event.x;
  event.subject.fy = event.y;
}

function dragended(event) {
  if (!event.active) simulation.alphaTarget(0);
  event.subject.fx = null;
  event.subject.fy = null;
}

function drawLink(d) {
  context.moveTo(d.source.x, d.source.y);
  context.lineTo(d.target.x, d.target.y);
  context.strokeStyle = "#3d3d3d";
  context.stroke();    
}

function drawNode(d) {
  context.moveTo(d.x + 3, d.y);
  context.arc(d.x, d.y, radius(d.size), 0, 2 * Math.PI); 
  context.fillStyle = d.color;
  console.log(d.atom + d.color);
  context.fill(); 
  context.stroke();    
}

    